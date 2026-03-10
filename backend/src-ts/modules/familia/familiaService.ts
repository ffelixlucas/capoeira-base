import "../../config/firebase";
import logger from "../../utils/logger";
import {
  buscarPorCpf,
  buscarPorFirebaseUid,
  buscarPorId,
  buscarAlunoVinculado,
  buscarMetricasAluno,
  criarAcesso,
  atualizarAcesso,
  FamiliaAcesso,
  listarAlunosVinculados,
  atualizarAlunoVinculado,
} from "./familiaRepository";
import { buscarPorSlug } from "../shared/organizacoes/organizacaoService";

const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

function normalizarCpf(cpf: string) {
  return String(cpf || "").replace(/\D/g, "");
}

function formatarCpf(cpf: string) {
  const digits = normalizarCpf(cpf);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function validarCpf(cpf: string) {
  const digits = normalizarCpf(cpf);
  return digits.length === 11;
}

function extrairTelefoneFirebase(decoded: any) {
  const phone = decoded.phone_number || null;
  return phone ? String(phone).trim().slice(0, 30) : null;
}

function montarJwtFamilia(acesso: FamiliaAcesso, slug: string) {
  return jwt.sign(
    {
      id: acesso.id,
      nome: acesso.nome,
      email: acesso.email || `familia-${acesso.id}@portal.local`,
      roles: ["familia"],
      organizacao_id: acesso.organizacao_id,
      grupo_id: null,
      slug,
      tipo_acesso: "familia",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function mapearPerfil(acesso: FamiliaAcesso, slug: string, organizacaoNome: string) {
  return {
    id: acesso.id,
    nome: acesso.nome,
    email: acesso.email,
    telefone: acesso.telefone,
    cpf: formatarCpf(acesso.cpf),
    roles: ["familia"],
    slug,
    organizacao_id: acesso.organizacao_id,
    organizacao_nome: organizacaoNome,
    status: acesso.status,
  };
}

export async function loginComFirebaseService(input: {
  slug: string;
  cpf: string;
  firebaseToken: string;
}) {
  const slug = String(input.slug || "").trim().toLowerCase();
  const cpf = normalizarCpf(input.cpf);
  const firebaseToken = String(input.firebaseToken || "").trim();

  if (!slug) {
    throw new Error("Slug da organização é obrigatório.");
  }
  if (!validarCpf(cpf)) {
    throw new Error("CPF inválido.");
  }
  if (!firebaseToken) {
    throw new Error("Token do Firebase é obrigatório.");
  }

  const organizacao = await buscarPorSlug(slug);

  const decoded = await admin.auth().verifyIdToken(firebaseToken);
  const firebaseUid = String(decoded.uid || "").trim();
  const provider = decoded.firebase?.sign_in_provider || null;
  const nome =
    String(decoded.name || decoded.email || `Responsável ${formatarCpf(cpf)}`).trim().slice(0, 180);
  const email = decoded.email ? String(decoded.email).trim().slice(0, 180) : null;
  const telefone = extrairTelefoneFirebase(decoded);

  if (!firebaseUid) {
    throw new Error("Não foi possível identificar o usuário no Firebase.");
  }

  const acessoPorUid = await buscarPorFirebaseUid(organizacao.id, firebaseUid);
  if (acessoPorUid && acessoPorUid.cpf !== cpf) {
    throw new Error("Esta conta Firebase já está vinculada a outro CPF nesta organização.");
  }

  let acesso = await buscarPorCpf(organizacao.id, cpf);

  if (acesso) {
    if (acesso.status === "bloqueado") {
      throw new Error("Acesso bloqueado. Entre em contato com a organização.");
    }

    await atualizarAcesso({
      id: acesso.id,
      organizacaoId: organizacao.id,
      nome,
      email,
      telefone,
      firebaseUid,
      provider,
      status: "ativo",
    });

    acesso = await buscarPorId(acesso.id, organizacao.id);
  } else {
    const id = await criarAcesso({
      organizacaoId: organizacao.id,
      cpf,
      nome,
      email,
      telefone,
      firebaseUid,
      provider,
    });

    acesso = await buscarPorId(id, organizacao.id);
  }

  if (!acesso) {
    throw new Error("Não foi possível concluir o acesso do portal da família.");
  }

  logger.info("[familiaService] Acesso do portal da família liberado", {
    familiaId: acesso.id,
    organizacaoId: acesso.organizacao_id,
    slug,
    provider,
  });

  return {
    token: montarJwtFamilia(acesso, slug),
    usuario: mapearPerfil(acesso, slug, organizacao.nome),
  };
}

export async function buscarPerfilFamiliaService(usuario: any) {
  const familiaId = Number(usuario?.id || 0);
  const organizacaoId = Number(usuario?.organizacao_id || 0);
  const slug = String(usuario?.slug || "").trim();

  if (!familiaId || !organizacaoId || !slug) {
    throw new Error("Sessão do portal da família inválida.");
  }

  const acesso = await buscarPorId(familiaId, organizacaoId);
  if (!acesso) {
    throw new Error("Acesso do portal da família não encontrado.");
  }
  if (acesso.status === "bloqueado") {
    throw new Error("Acesso bloqueado. Entre em contato com a organização.");
  }

  const organizacao = await buscarPorSlug(slug);

  return mapearPerfil(acesso, slug, organizacao.nome);
}

async function obterAcessoFamilia(usuario: any) {
  const familiaId = Number(usuario?.id || 0);
  const organizacaoId = Number(usuario?.organizacao_id || 0);

  if (!familiaId || !organizacaoId) {
    throw new Error("Sessão do portal da família inválida.");
  }

  const acesso = await buscarPorId(familiaId, organizacaoId);
  if (!acesso) {
    throw new Error("Acesso do portal da família não encontrado.");
  }

  return acesso;
}

function periodoAtual() {
  const hoje = new Date();
  const fim = hoje.toISOString().split("T")[0];
  const inicio = `${hoje.getFullYear()}-01-01`;
  return { inicio, fim };
}

async function montarAlunoComMetricas(organizacaoId: number, aluno: any) {
  const { inicio, fim } = periodoAtual();
  const metricas = await buscarMetricasAluno(organizacaoId, aluno.id, inicio, fim);
  const taxaPresenca =
    metricas.total > 0 ? Number((metricas.presentes / metricas.total).toFixed(2)) : 0;

  return {
    ...aluno,
    metricas: {
      ...metricas,
      taxa_presenca: taxaPresenca,
      inicio,
      fim,
    },
  };
}

export async function listarAlunosFamiliaService(usuario: any) {
  const acesso = await obterAcessoFamilia(usuario);
  const alunos = await listarAlunosVinculados(acesso.organizacao_id, acesso.cpf);

  return Promise.all(
    alunos.map((aluno) => montarAlunoComMetricas(acesso.organizacao_id, aluno))
  );
}

export async function buscarAlunoFamiliaService(usuario: any, alunoId: number) {
  const acesso = await obterAcessoFamilia(usuario);
  const aluno = await buscarAlunoVinculado(acesso.organizacao_id, acesso.cpf, alunoId);

  if (!aluno) {
    throw new Error("Aluno não encontrado para este responsável.");
  }

  return montarAlunoComMetricas(acesso.organizacao_id, aluno);
}

export async function atualizarAlunoFamiliaService(
  usuario: any,
  alunoId: number,
  dados: Record<string, any>
) {
  const acesso = await obterAcessoFamilia(usuario);
  await atualizarAlunoVinculado(acesso.organizacao_id, acesso.cpf, alunoId, dados);
  return buscarAlunoFamiliaService(usuario, alunoId);
}

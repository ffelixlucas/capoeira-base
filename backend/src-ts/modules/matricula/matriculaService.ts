import logger from "../../utils/logger";
import matriculaRepository, {
  DadosCriarMatricula,
} from "./matriculaRepository";
import emailService from "../../services/emailService";
import * as notificacaoService from "../notificacaoDestinos/notificacaoDestinosService";
import preMatriculasRepository from "../public/preMatriculas/preMatriculasRepository";

import {
  gerarEmailMatriculaAprovada,
  gerarEmailMatriculaAprovadaAdmin,
} from "../../services/templates/matriculaAprovada";

import { gerarEmailMatriculaRecusada } from "../../services/templates/matriculaRecusada";

// Tipo temporário até migrarmos completamente
type DadosMatricula = any;

function normalizarDadosPessoa(obj: any) {
  obj.cpf = obj.cpf?.replace(/\D/g, "") || "";
  obj.email = obj.email?.toLowerCase().trim() || null;
}

function calcularIdade(nascimento: string) {
  const hoje = new Date();
  const nasc = new Date(nascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

/* -------------------------------------------------------------------------- */
/* 🔹 CRIAR MATRÍCULA                                                         */
/* -------------------------------------------------------------------------- */
async function criarMatricula(dados: DadosMatricula) {
  // ... SEU CÓDIGO AQUI (permanece igual)
}

/* -------------------------------------------------------------------------- */
/* 🔹 CRIAR MATRÍCULA DIRETA A PARTIR DE PRÉ-MATRÍCULA                        */
/* -------------------------------------------------------------------------- */
async function criarMatriculaDireta(pre: any) {
  // ... SEU CÓDIGO AQUI (permanece igual)
}

/* -------------------------------------------------------------------------- */
/* 🔹 BUSCAR POR CPF (AGORA MULTI-ORG)                                        */
/* -------------------------------------------------------------------------- */
async function buscarPorCpf(cpf: string, organizacao_id: number) {
  return matriculaRepository.buscarPorCpf(cpf, organizacao_id);
}



/* -------------------------------------------------------------------------- */
/* 🔹 E-MAIL DE RECUSA                                                        */
/* -------------------------------------------------------------------------- */
async function enviarEmailRecusaMatricula(matricula: any) {
  // ... SEU CÓDIGO AQUI (permanece igual)
}

/* -------------------------------------------------------------------------- */
/* 🔹 APROVAR PRÉ-MATRÍCULA (ADMIN ESCOLHE A TURMA) — FUNÇÃO FINAL            */
/* -------------------------------------------------------------------------- */
async function aprovarPreMatricula(payload: {
  preMatriculaId: number;
  turma_id: number;
  organizacao_id: number;
}) {
  const { preMatriculaId, turma_id, organizacao_id } = payload;

  logger.info("[matriculaService] Aprovando pré-matrícula manual", {
    preMatriculaId,
    turma_id,
    organizacao_id,
  });

  // Buscar pré-matrícula
  const pre = await preMatriculasRepository.buscarPorId(
    preMatriculaId,
    organizacao_id
  );

  if (!pre) {
    throw new Error("Pré-matrícula não encontrada.");
  }

  normalizarDadosPessoa(pre);

  // 🔎 Verifica se já existe aluno com este CPF *na mesma organização*
  const existente = await matriculaRepository.buscarPorCpf(pre.cpf, organizacao_id);

  if (existente && existente.organizacao_id === organizacao_id) {
    throw new Error("Já existe um aluno com este CPF nesta organização.");
  }

  const idade = calcularIdade(pre.nascimento);

  const dadosAluno: DadosCriarMatricula = {
    organizacao_id,
    nome: pre.nome,
    apelido: pre.apelido || null,
    nascimento: pre.nascimento,
    cpf: pre.cpf,
    email: pre.email,
    telefone_aluno: pre.telefone_aluno || null,
    telefone_responsavel: pre.telefone_responsavel || null,
    nome_responsavel: pre.nome_responsavel || null,
    responsavel_documento: pre.responsavel_documento || null,
    responsavel_parentesco: pre.responsavel_parentesco || null,
    endereco: pre.endereco || null,
    observacoes_medicas: pre.observacoes_medicas || null,
    autorizacao_imagem: Number(pre.autorizacao_imagem),
    aceite_lgpd: Number(pre.aceite_lgpd),
    foto_url: pre.foto_url || null,
    categoria_id: pre.categoria_id || null,
    graduacao_id: pre.graduacao_id || null,
    turma_id,
    status: "ativo",
    criado_por: null,
  };

  const novoAluno = await matriculaRepository.criar(dadosAluno);

  await preMatriculasRepository.deletar(preMatriculaId, organizacao_id);

  // E-mails
  try {
    const dadosEmail = await matriculaRepository.buscarDadosEmailAprovacao(
      turma_id,
      organizacao_id
    );

    if (pre.email) {
      const htmlAluno = gerarEmailMatriculaAprovada({
        ...pre,
        ...dadosEmail,
      });

      await emailService.enviarEmailCustom({
        to: pre.email,
        subject: "🎉 Matrícula aprovada – bem-vindo(a)!",
        html: htmlAluno,
      });
    }

    const emailsAdmin = await notificacaoService.getEmails(
      organizacao_id,
      "matricula"
    );

    const htmlAdmin = gerarEmailMatriculaAprovadaAdmin({
      ...pre,
      ...dadosEmail,
    });

    for (const email of emailsAdmin) {
      await emailService.enviarEmailCustom({
        to: email,
        subject: "✅ Nova matrícula confirmada",
        html: htmlAdmin,
      });
    }
  } catch (err: any) {
    logger.error("[matriculaService] Erro ao enviar e-mails:", err.message);
  }

  return {
    sucesso: true,
    mensagem: "Pré-matrícula aprovada e aluno criado.",
    alunoId: novoAluno.id,
  };
}

/* -------------------------------------------------------------------------- */
/* 🔹 EXPORT FINAL LIMPO (SEM SUBLINHADO NO VS CODE)                           */
/* -------------------------------------------------------------------------- */
export default {
  criarMatricula,
  criarMatriculaDireta,
  buscarPorCpf,
  enviarEmailRecusaMatricula,
  aprovarPreMatricula, // ✔️ AGORA ESTÁ CERTO
};

import  logger  from "../../utils/logger";
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
  try {
    normalizarDadosPessoa(dados);

    const usuario = dados.usuario || null;

    // Garantir organização
    if (usuario?.organizacao_id && !dados.organizacao_id) {
      dados.organizacao_id = usuario.organizacao_id;
      logger.debug(
        `[matriculaService] organizacao_id herdado do token → ${dados.organizacao_id}`
      );
    }

    if (!dados.organizacao_id) {
      logger.warn("[matriculaService] organizacao_id ausente no payload.");
    }

    // Checar duplicidade por CPF
    const existente = await matriculaRepository.buscarPorCpf(dados.cpf);
    if (existente) throw new Error("Já existe um aluno com este CPF.");

    // Calcular idade
    const idade = calcularIdade(dados.nascimento);
    logger.debug(`[matriculaService] Idade calculada → ${idade}`);

    // Detectar turma
    const turma = await matriculaRepository.buscarTurmaPorIdade(
      idade,
      dados.organizacao_id
    );

    logger.debug("[matriculaService] Turma detectada:", turma);

    if (!turma) throw new Error("Nenhuma turma disponível para esta idade.");

    dados.turma_id = turma.turma_id;
    dados.categoria_id = turma.categoria_id || null;
    dados.categoria_nome = turma.categoria_nome || null;

    logger.debug(`[matriculaService] turma_id atribuído → ${dados.turma_id}`);

    // Garantir organização por fallback da turma
    if (!dados.organizacao_id) {
      dados.organizacao_id =
        await matriculaRepository.buscarOrganizacaoPorTurmaId(turma.turma_id);

      logger.debug(
        `[matriculaService] organizacao_id herdado da turma → ${dados.organizacao_id}`
      );
    }

    if (!dados.organizacao_id)
      throw new Error(
        "Falha ao determinar organização da matrícula (multi-org)."
      );

    logger.info("[matriculaService] Criando aluno/matrícula", {
      nome: dados.nome,
      idade,
      turma_id: dados.turma_id,
      organizacao_id: dados.organizacao_id,
    });

    const novoAluno = await matriculaRepository.criar(dados);

    logger.info("[matriculaService] Matrícula criada com sucesso", {
      alunoId: novoAluno.id,
      organizacao_id: dados.organizacao_id,
    });

    /* ----------------------- ENVIO DE E-MAILS ----------------------- */
    try {
      // Fallback para turma_id antes de email
      if (!dados.turma_id) {
        const turmaFallback = await matriculaRepository.buscarTurmaPorIdade(
          idade,
          dados.organizacao_id
        );

        if (turmaFallback) {
          dados.turma_id = turmaFallback.turma_id;
        }
      }

      const dadosEmail = await matriculaRepository.buscarDadosEmailAprovacao(
        dados.turma_id,
        dados.organizacao_id
      );

      logger.debug(
        "[matriculaService] Dados do e-mail de matrícula:",
        dadosEmail
      );

      // E-mail do aluno
      if (dados.email) {
        const htmlAluno = gerarEmailMatriculaAprovada({
          ...dados,
          ...dadosEmail,
        });

        await emailService.enviarEmailCustom({
          to: dados.email,
          subject: "🎉 Matrícula aprovada – bem-vindo(a)!",
          html: htmlAluno,
        });
      }

      // E-mails admin
      const emailsAdmin = await notificacaoService.getEmails(
        dados.organizacao_id,
        "matricula"
      );

      const htmlAdmin = gerarEmailMatriculaAprovadaAdmin({
        ...dados,
        ...dadosEmail,
      });

      for (const email of emailsAdmin) {
        try {
          await emailService.enviarEmailCustom({
            to: email,
            subject: "✅ Nova matrícula confirmada",
            html: htmlAdmin,
          });
        } catch (err: any) {
          logger.warn(
            `[matriculaService] Falha ao enviar e-mail admin ${email}: ${err.message}`
          );
        }
      }

      logger.info(
        `[matriculaService] org ${dados.organizacao_id} - e-mails enviados`
      );
    } catch (err: any) {
      logger.error("[matriculaService] Erro ao enviar e-mails:", err.message);
    }

    return novoAluno;
  } catch (err: any) {
    logger.error("[matriculaService] Erro:", err.message);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 CRIAR MATRÍCULA DIRETA A PARTIR DE PRÉ-MATRÍCULA                        */
/* -------------------------------------------------------------------------- */
async function criarMatriculaDireta(pre: any) {
  const organizacao_id = pre.organizacao_id;

  logger.debug(
    `[matriculaService] org ${organizacao_id} - criando matrícula direta da pré ${pre.id}`
  );

  try {
    normalizarDadosPessoa(pre);

    if (!pre.organizacao_id)
      throw new Error("Organização ausente na pré-matrícula.");

    const existente = await matriculaRepository.buscarPorCpf(pre.cpf);
    if (existente)
      throw new Error("Já existe um aluno com este CPF nesta organização.");

    const idade = calcularIdade(pre.nascimento);

    const turma = await matriculaRepository.buscarTurmaPorIdade(
      idade,
      pre.organizacao_id
    );

    if (turma) {
      pre.turma_id = turma.turma_id;
    }

    const dadosAluno: DadosCriarMatricula = {
      organizacao_id: pre.organizacao_id,
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
      turma_id: pre.turma_id || null,
      status: "ativo",
      criado_por: null,
    };

    const novoAluno = await matriculaRepository.criar(dadosAluno);

    await preMatriculasRepository.atualizarStatus(
      pre.id,
      "aprovado",
      pre.organizacao_id
    );

    /* ----------------------- E-MAILS -------------------------------- */
    try {
      const dadosEmail = await matriculaRepository.buscarDadosEmailAprovacao(
        pre.turma_id,
        pre.organizacao_id
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
        pre.organizacao_id,
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
      logger.error(
        `[matriculaService] Erro ao enviar e-mails de matrícula direta: ${err.message}`
      );
    }

    return novoAluno.id;
  } catch (err: any) {
    logger.error(
      `[matriculaService] org ${organizacao_id} - erro em criarMatriculaDireta: ${err.message}`
    );
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 BUSCAR POR CPF                                                          */
/* -------------------------------------------------------------------------- */
async function buscarPorCpf(cpf: string) {
  return matriculaRepository.buscarPorCpf(cpf);
}

/* -------------------------------------------------------------------------- */
/* 🔹 E-MAIL DE RECUSA                                                        */
/* -------------------------------------------------------------------------- */
async function enviarEmailRecusaMatricula(matricula: any) {
  try {
    const org = await matriculaRepository.buscarDadosOrganizacao(
      matricula.organizacao_id
    );

    if (!org || !matricula.email) return;

    const html = gerarEmailMatriculaRecusada({
      ...matricula,
      nome_fantasia: org.nome_fantasia,
      telefone: org.telefone,
    });

    await emailService.enviarEmailCustom({
      to: matricula.email,
      subject: "⚠️ Atualização sobre sua matrícula",
      html,
    });
  } catch (err: any) {
    logger.error(
      `[matriculaService] Erro ao enviar e-mail de recusa: ${err.message}`
    );
  }
}

export default {
  criarMatricula,
  criarMatriculaDireta,
  buscarPorCpf,
  enviarEmailRecusaMatricula,
};

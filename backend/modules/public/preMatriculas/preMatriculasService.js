// 🎯 Service - Pré-Matrículas Públicas
// Contém as regras de negócio e validações antes de salvar no banco.

const preMatriculasRepository = require("./preMatriculasRepository");
const emailService = require("../../../services/emailService");
const notificacaoService = require("../../notificacaoDestinos/notificacaoDestinosService");
const db = require("../../../database/connection");
const logger = require("../../../utils/logger");

/**
 * Cria uma nova pré-matrícula com validações básicas e envia e-mails
 */
async function criarPreMatricula(dados) {
  try {
    logger.info(
      "[preMatriculasService] Recebendo solicitação de pré-matrícula"
    );

    // 🔍 Validações básicas
    if (!dados.nome || !dados.nascimento || !dados.cpf || !dados.email) {
      throw new Error("Campos obrigatórios não preenchidos.");
    }

    // Normalizações
    dados.cpf = dados.cpf.replace(/\D/g, "");
    dados.email = dados.email.toLowerCase().trim();
    dados.telefone = dados.telefone?.replace(/\D/g, "") || null;

    // Define grupo de origem se vier no payload
    if (dados.grupo_personalizado) {
      dados.grupo_origem = dados.grupo_personalizado;
    }

    // Normaliza o campo ja_treinou
    dados.ja_treinou =
      dados.ja_treinou === "sim" || dados.ja_treinou === "nao"
        ? dados.ja_treinou
        : "nao";

    // Grava no banco
    const id = await preMatriculasRepository.criarPreMatricula(dados);
    logger.info("[preMatriculasService] Pré-matrícula registrada com sucesso", {
      id,
    });

    // ✉️ Envia e-mails de confirmação e notificação
    try {
      // Para o aluno/responsável
      await emailService.enviarEmailCustom({
        to: dados.email,
        subject: "📩 Pré-matrícula recebida",
        html: `
          <p>Olá ${dados.nome},</p>
          <p>Sua pré-matrícula foi recebida e está <b>aguardando aprovação</b>.</p>
          <p>Em breve entraremos em contato com mais informações.</p>
        `,
      });

      // Para os administradores (notificação)
      const emailsAdmin = await notificacaoService.getEmails(
        dados.organizacao_id,
        "matricula"
      );

      for (const email of emailsAdmin) {
        await emailService.enviarEmailCustom({
          to: email,
          subject: "👥 Nova pré-matrícula pendente",
          html: `
            <p>Nova pré-matrícula pendente:</p>
            <ul>
              <li><b>Nome:</b> ${dados.nome}</li>
              <li><b>CPF:</b> ${dados.cpf}</li>
              <li><b>Email:</b> ${dados.email}</li>
              <li><b>Telefone:</b> ${dados.telefone || "não informado"}</li>
            </ul>
          `,
        });
      }
    } catch (err) {
      logger.error(
        "[preMatriculasService] Erro ao enviar e-mails:",
        err.message
      );
    }

    return {
      message: "Pré-matrícula criada com sucesso. Aguarde aprovação.",
      id,
    };
  } catch (err) {
    logger.error(
      "[preMatriculasService] Erro ao criar pré-matrícula:",
      err.message
    );
    throw err;
  }
}

/**
 * Lista todas as pré-matrículas pendentes de uma organização
 */
async function listarPendentes(organizacaoId) {
  try {
    const lista = await preMatriculasRepository.listarPendentes(organizacaoId);
    return lista;
  } catch (err) {
    logger.error(
      "[preMatriculasService] Erro ao listar pendentes:",
      err.message
    );
    throw err;
  }
}

/**
 * Atualiza o status de uma pré-matrícula
 */
async function atualizarStatus(id, status) {
  try {
    await preMatriculasRepository.atualizarStatus(id, status);
    return { message: `Status atualizado para ${status}` };
  } catch (err) {
    logger.error(
      "[preMatriculasService] Erro ao atualizar status:",
      err.message
    );
    throw err;
  }
}
async function buscarPorId(id) {
  const [rows] = await db.execute("SELECT * FROM pre_matriculas WHERE id = ?", [
    id,
  ]);
  return rows.length ? rows[0] : null;
}

module.exports = {
  criarPreMatricula,
  listarPendentes,
  atualizarStatus,
  buscarPorId,
};

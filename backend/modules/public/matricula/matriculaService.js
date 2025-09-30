// modules/public/matricula/matriculaService.js
// 🎯 Service da Matrícula Pública
// Regras de negócio: duplicidade CPF, atribuição de turma por idade (dinâmica por faixa etária),
// status pendente, disparo de e-mails.

const matriculaRepository = require("./matriculaRepository");
const emailService = require("../../../services/emailService"); // já existente no projeto
const logger = require("../../../utils/logger");
const notificacaoService = require("../../notificacaoDestinos/notificacaoDestinosService"); // para buscar e-mails de notificação

/**
 * Calcula idade exata em anos a partir da data de nascimento
 */
function calcularIdade(nascimento) {
  const hoje = new Date();
  const nasc = new Date(nascimento);

  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();

  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }

  return idade;
}

async function criarMatricula(dados) {
  try {
    // 1. Validar CPF duplicado
    dados.cpf = dados.cpf.replace(/\D/g, "");

    const existente = await matriculaRepository.buscarPorCpf(dados.cpf);
    if (existente) {
      throw new Error("Já existe uma matrícula com este CPF.");
    }

    // 2. Calcular idade do aluno
    const idade = calcularIdade(dados.nascimento);

    // 3. Buscar turma que se encaixe na faixa etária
    let turmaId = await matriculaRepository.buscarTurmaPorIdade(idade);

    if (!turmaId) {
      throw new Error("No momento não há turmas disponíveis para esta idade.");
    }

    dados.turma_id = turmaId;

    // 🔥 Buscar organizacao_id da turma via repository
    dados.organizacao_id =
      await matriculaRepository.buscarOrganizacaoPorTurmaId(turmaId);

    // 4. Criar aluno com status pendente
    logger.debug("[matriculaService] Dados recebidos para criar:", dados);

    const novoAluno = await matriculaRepository.criar(dados);

    // 5. Disparar e-mails
    try {
      // Para o responsável
      await emailService.enviarEmailCustom({
        to: dados.email,
        subject: "📩 Matrícula recebida",
        html: `<p>Olá ${dados.nome},</p>
             <p>Sua matrícula foi recebida e está <b>aguardando aprovação</b>.</p>`,
      });

      // Para o admin
      // Buscar e-mails de notificação para matrícula
      logger.info(
        "[matriculaService] Disparando notificações para organizacao:",
        dados.organizacao_id
      );

      const emails = await notificacaoService.getEmails(
        dados.organizacao_id,
        "matricula"
      );

      // Enviar para cada destino configurado
      for (const email of emails) {
        await emailService.enviarEmailCustom({
          to: email,
          subject: "👥 Nova matrícula pendente",
          html: `<p>Nova matrícula pendente: <b>${dados.nome}</b> (${dados.cpf})</p>`,
        });
      }
    } catch (err) {
      logger.error("[matriculaService] Erro ao enviar e-mails:", err.message);
    }

    logger.info("[matriculaService] Matrícula criada com sucesso", {
      alunoId: novoAluno.id,
      idade,
    });

    return novoAluno;
  } catch (err) {
    logger.error("[matriculaService] Erro:", err.message);
    throw err;
  }
}
async function getGrupo(organizacaoId) {
  return await matriculaRepository.buscarGrupoPorOrganizacaoId(organizacaoId);
}



module.exports = { criarMatricula , getGrupo};

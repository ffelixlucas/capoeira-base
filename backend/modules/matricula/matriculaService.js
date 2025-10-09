// 🎯 Service da Matrícula (Admin)
// Agora usado apenas após aprovação da pré-matrícula

const matriculaRepository = require("./matriculaRepository");
const emailService = require("../../services/emailService");
const logger = require("../../utils/logger");
const notificacaoService = require("../notificacaoDestinos/notificacaoDestinosService");

/**
 * Calcula idade exata em anos a partir da data de nascimento
 */
function calcularIdade(nascimento) {
  const hoje = new Date();
  const nasc = new Date(nascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

/**
 * Cria aluno e matrícula após aprovação
 */
async function criarMatricula(dados) {
  try {
    // Normaliza CPF
    dados.cpf = dados.cpf.replace(/\D/g, "");

    // Evita duplicidade
    const existente = await matriculaRepository.buscarPorCpf(dados.cpf);
    if (existente) {
      throw new Error("Já existe um aluno com este CPF.");
    }

    // Calcula idade e busca turma compatível
    const idade = calcularIdade(dados.nascimento);
    const turma = await matriculaRepository.buscarTurmaPorIdade(idade);

    if (!turma) {
      throw new Error("Nenhuma turma disponível para esta idade.");
    }

    // Atribui dados completos da turma
    dados.turma_id = turma.turma_id;
    dados.categoria_id = turma.categoria_id || null;
    dados.categoria_nome = turma.categoria_nome || null;

    // Busca organização da turma
    dados.organizacao_id =
      await matriculaRepository.buscarOrganizacaoPorTurmaId(turma.turma_id);

    logger.info("[matriculaService] Turma encontrada:", {
      idade,
      turma_id: turma.turma_id,
      categoria: turma.categoria_nome,
    });

    // Cria aluno + matrícula
    const novoAluno = await matriculaRepository.criar(dados);
    logger.info("[matriculaService] Matrícula criada com sucesso", {
      alunoId: novoAluno.id,
    });

    // Envia e-mails de confirmação (já aprovado)
    try {
      await emailService.enviarEmailCustom({
        to: dados.email,
        subject: "🎓 Matrícula confirmada",
        html: `<p>Olá ${dados.nome},</p>
               <p>Sua matrícula foi <b>confirmada</b> com sucesso!</p>`,
      });

      const emailsAdmin = await notificacaoService.getEmails(
        dados.organizacao_id,
        "matricula"
      );

      for (const email of emailsAdmin) {
        await emailService.enviarEmailCustom({
          to: email,
          subject: "✅ Nova matrícula confirmada",
          html: `<p>Nova matrícula confirmada: <b>${dados.nome}</b> (${dados.cpf})</p>`,
        });
      }
    } catch (err) {
      logger.error("[matriculaService] Erro ao enviar e-mails:", err.message);
    }

    return novoAluno;
  } catch (err) {
    logger.error("[matriculaService] Erro:", err.message);
    throw err;
  }
}

module.exports = { criarMatricula };

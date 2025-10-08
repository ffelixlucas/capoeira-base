// 🎯 Controller da Matrícula (Admin)
// Responsável por criar aluno e matrícula após aprovação da pré-matrícula.

const matriculaService = require("./matriculaService");
const logger = require("../../utils/logger");

/**
 * Cria aluno e matrícula (após aprovação da pré-matrícula)
 */
async function criarMatricula(req, res) {
  try {
    const dados = req.body;

    logger.info("[matriculaController] Criando matrícula aprovada", { nome: dados.nome });

    const resultado = await matriculaService.criarMatricula(dados);

    return res.status(201).json({
      message: "Matrícula confirmada com sucesso.",
      aluno: resultado,
    });
  } catch (err) {
    logger.error("[matriculaController] Erro ao criar matrícula:", err.message);
    return res.status(400).json({
      error: err.message || "Erro ao criar matrícula.",
    });
  }
}

module.exports = { criarMatricula };

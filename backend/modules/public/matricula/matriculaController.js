// modules/public/matricula/matriculaController.js
// 🎯 Controller da Matrícula Pública
// Responsável por receber requests HTTP e delegar para o service.

const matriculaService = require("./matriculaService");
const logger = require("../../../utils/logger");

async function criarMatricula(req, res) {
  try {
    const dados = req.body;

    const resultado = await matriculaService.criarMatricula(dados);

    return res.status(201).json({
      message: "Matrícula criada com sucesso. Aguarde aprovação.",
      aluno: resultado,
    });
  } catch (err) {
    logger.error("[matriculaController] Erro ao criar matrícula:", err.message);

    return res.status(400).json({
      error: err.message || "Erro ao processar matrícula.",
    });
  }
}
async function getGrupo(req, res) {
  try {
    const { organizacaoId } = req.params;
    const grupo = await matriculaService.getGrupo(organizacaoId);
    return res.json({ grupo });
  } catch (err) {
    return res.status(400).json({ error: "Erro ao buscar grupo." });
  }
}




module.exports = { criarMatricula, getGrupo,};

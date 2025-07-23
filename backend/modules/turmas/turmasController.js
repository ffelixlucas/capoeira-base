// backend/modules/turmas/turmasController.js
const service = require("./turmasService.js");

async function listarTurmasAtivas(req, res) {
  try {
    const turmas = await service.listarAtivas();
    res.json(turmas);
  } catch (err) {
    console.error("Erro ao listar turmas:", err);
    res.status(500).json({ erro: "Erro ao listar turmas" });
  }
}

module.exports = { listarTurmasAtivas };

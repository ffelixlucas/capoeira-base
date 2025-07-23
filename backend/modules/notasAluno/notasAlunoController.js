// backend/modules/notasAluno/notasAlunoController.js
const service = require("./notasAlunoService");

async function listarPorAluno(req, res) {
  try {
    const notas = await service.listarPorAluno(req.params.alunoId);
    res.json(notas);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar notas" });
  }
}

async function criar(req, res) {
  try {
    const { texto } = req.body;
    const equipeId = req.usuario.id;
    const nota = await service.criar(req.params.alunoId, equipeId, texto);
    res.status(201).json(nota);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
}

async function excluir(req, res) {
  try {
    const equipeId = req.usuario.id;
    const isAdmin = req.usuario.roles.includes("admin");
    await service.excluir(req.params.id, equipeId, isAdmin);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(403).json({ erro: err.message });
  }
}

module.exports = { listarPorAluno, criar, excluir };

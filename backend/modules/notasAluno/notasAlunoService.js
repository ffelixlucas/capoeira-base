// backend/modules/notasAluno/notasAlunoService.js
const repo = require("./notasAlunoRepository");

async function listarPorAluno(alunoId) {
  return await repo.listarPorAluno(alunoId);
}

async function criar(alunoId, equipeId, texto) {
  if (!texto || !texto.trim()) throw new Error("Texto obrigatório");
  return await repo.criar({ aluno_id: alunoId, equipe_id: equipeId, texto });
}

async function excluir(id, equipeId, isAdmin) {
  const nota = await repo.buscarPorId(id);
  if (!nota) throw new Error("Nota não encontrada");

  if (!isAdmin && nota.equipe_id !== equipeId) {
    throw new Error("Sem permissão para excluir");
  }

  await repo.excluir(id);
}

module.exports = { listarPorAluno, criar, excluir };

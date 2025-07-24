// alunosService.js
const alunoRepo = require("./alunosRepository");
const turmaRepo = require("../turmas/turmasRepository");


async function listarTodos(usuario) {
  if (usuario.roles.includes("admin")) {
    return await alunoRepo.listarAlunosComTurmaAtual();
  }

  const turmas = await turmaRepo.listarTurmasPorEquipe(usuario.id);

  if (!turmas || turmas.length === 0) return [];

  const turmaIds = turmas.map(t => t.id);
  return await alunoRepo.listarAlunosPorTurmas(turmaIds);
}

async function buscarPorId(id) {
  const aluno = await alunoRepo.buscarPorId(id);
  if (!aluno) throw new Error("Aluno não encontrado");
  return aluno;
}

async function cadastrarAluno(dados) {
  const alunoId = await alunoRepo.criarAluno(dados);

  if (!dados.turma_id) throw new Error("Turma obrigatória");
  await alunoRepo.trocarTurma(alunoId, dados.turma_id);

  return alunoId;
}

async function editarAluno(id, dados) {
  const aluno = await alunoRepo.buscarPorId(id);
  if (!aluno) throw new Error("Aluno não encontrado");

  await alunoRepo.editarAluno(id, dados);
}

async function deletarAluno(id) {
  const aluno = await alunoRepo.buscarPorId(id);
  if (!aluno) throw new Error("Aluno não encontrado");

  await alunoRepo.excluirAluno(id);
}

async function trocarTurma(id, novaTurmaId) {
  const aluno = await alunoRepo.buscarPorId(id);
  if (!aluno) throw new Error("Aluno não encontrado");

  await alunoRepo.trocarTurma(id, novaTurmaId);
}

module.exports = {
  listarTodos,
  buscarPorId,
  cadastrarAluno,
  editarAluno,
  deletarAluno,
  trocarTurma
};

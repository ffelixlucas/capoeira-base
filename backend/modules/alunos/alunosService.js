// alunosService.js
const alunoRepo = require("./alunosRepository");
const turmaRepo = require("../turmas/turmasRepository");


async function listarTodos(usuario, turmaId = null) {
  // Se for admin
  if (usuario.roles.includes("admin")) {
    if (turmaId) {
      return await alunoRepo.listarAlunosPorTurmas([turmaId]);
    }
    return await alunoRepo.listarAlunosComTurmaAtual();
  }

  // Se for instrutor
  const turmas = await turmaRepo.listarTurmasPorEquipe(usuario.id);
  if (!turmas || turmas.length === 0) return [];

  const turmaIds = turmas.map(t => t.id);

  // Se estiver filtrando por uma turma específica, verifica se ela é da responsabilidade do instrutor
  if (turmaId) {
    if (!turmaIds.includes(Number(turmaId))) return []; // acesso negado
    return await alunoRepo.listarAlunosPorTurmas([turmaId]);
  }

  // Retorna todas as turmas que o instrutor gerencia
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

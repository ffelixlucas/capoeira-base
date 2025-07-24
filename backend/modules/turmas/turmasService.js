const turmasRepository = require("./turmasRepository");

async function listarTurmasAtivas() {
  return await turmasRepository.buscarTodasComInstrutor();
}

async function criarTurma(data) {
  return await turmasRepository.inserirTurma(data);
}

async function atualizarTurma(id, data) {
  return await turmasRepository.atualizarTurma(id, data);
}

async function excluirTurma(id) {
  return await turmasRepository.deletarTurma(id);
}

async function listarTurmasPorEquipe(equipe_id) {
  return await turmasRepository.listarPorEquipe(equipe_id);
}

const alunosRepository = require("../alunos/alunosRepository");

async function encerrarTurmaComMigracao(origemId, destinoId) {
  // 1. Atualiza todos os alunos para nova turma
  await alunosRepository.migrarAlunosDeTurma(origemId, destinoId);

  // 2. Deleta a turma original
  await turmasRepository.deletarTurma(origemId);
}


module.exports = {
  listarTurmasAtivas,
  criarTurma,
  atualizarTurma,
  excluirTurma,
  listarTurmasPorEquipe,
  encerrarTurmaComMigracao,


};

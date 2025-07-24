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

module.exports = {
  listarTurmasAtivas,
  criarTurma,
  atualizarTurma,
  excluirTurma,
  listarTurmasPorEquipe,

};

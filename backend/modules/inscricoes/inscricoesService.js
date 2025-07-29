const inscricoesRepository = require('./inscricoesRepository');

async function listarPorEvento(eventoId) {
  return inscricoesRepository.listarPorEvento(eventoId);
}

async function buscarPorId(id) {
  return inscricoesRepository.buscarPorId(id);
}

async function criarInscricao(dados) {
  return inscricoesRepository.criarInscricao(dados);
}

async function processarWebhook(payload) {
  return inscricoesRepository.atualizarStatus(payload);
}

module.exports = {
  listarPorEvento,
  buscarPorId,
  criarInscricao,
  processarWebhook
};

// backend/modules/inscricoes/inscricoesService.js
const inscricoesRepository = require("./inscricoesRepository");
const { registrarLogTransacao } = require("./logsRepository");

// Lista inscritos de um evento
async function listarPorEvento(eventoId, busca) {
  return await inscricoesRepository.listarPorEvento(eventoId, busca);
}

// Busca inscrição pelo ID
async function buscarPorId(id) {
  return await inscricoesRepository.buscarPorId(id);
}

// Cria inscrição manual (painel)
async function criarInscricao(dados) {
  return await inscricoesRepository.criarInscricao(dados);
}

// Atualiza inscrição
async function atualizarInscricao(id, dados) {
  return await inscricoesRepository.atualizarInscricao(id, dados);
}

// Deleta inscrição
async function deletarInscricao(id) {
  return await inscricoesRepository.deletarInscricao(id);
}

// Extorna pagamento
async function extornarPagamentoService(id) {
  const refundInfo = {
    refund_id: `REF-${Date.now()}`,
    refund_valor: 0,
    status: "extornado",
  };

  await inscricoesRepository.atualizarInscricaoParaExtornado(id, refundInfo);
  await registrarLogTransacao(id, "extorno", "sucesso", refundInfo);

  return { id, ...refundInfo };
}

module.exports = {
  listarPorEvento,
  buscarPorId,
  criarInscricao,
  atualizarInscricao,
  deletarInscricao,
  extornarPagamentoService,
};

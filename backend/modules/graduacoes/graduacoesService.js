// modules/graduacoes/graduacoesService.js
const graduacoesRepository = require("./graduacoesRepository.js");

async function listarPorCategoria(categoria) {
  return await graduacoesRepository.listarPorCategoria(categoria);
}

async function listarTodas() {
  return await graduacoesRepository.listarTodas();
}

module.exports = { listarPorCategoria, listarTodas };

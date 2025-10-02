// modules/graduacoes/graduacoesService.js
const graduacoesRepository = require("./graduacoesRepository");
const { logger } = require("../../utils/logger");

async function listarPorCategoria(categoriaId) {
  logger.info("[graduacoesService] Chamando listarPorCategoria", { categoriaId });
  return await graduacoesRepository.listarPorCategoria(categoriaId);
}

async function listarTodas() {
  logger.info("[graduacoesService] Chamando listarTodas");
  return await graduacoesRepository.listarTodas();
}

module.exports = { listarPorCategoria, listarTodas };

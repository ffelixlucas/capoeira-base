// modules/graduacoes/graduacoesService.js
const graduacoesRepository = require("./graduacoesRepository");
const { logger } = require("../../utils/logger");

/* -------------------------------------------------------------------------- */
/* 🔍 Listar por categoria                                                    */
/* -------------------------------------------------------------------------- */
async function listarPorCategoria(categoriaId, organizacaoId) {
  logger.debug("[graduacoesService] listarPorCategoria", {
    categoriaId,
    organizacaoId,
  });

  return graduacoesRepository.listarPorCategoria(categoriaId, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔍 Listar todas                                                            */
/* -------------------------------------------------------------------------- */
async function listarTodas(organizacaoId) {
  logger.debug("[graduacoesService] listarTodas", { organizacaoId });

  return graduacoesRepository.listarTodas(organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* ➕ Criar graduação                                                          */
/* -------------------------------------------------------------------------- */
async function criar({ categoriaId, nome, ordem, organizacaoId }) {
  logger.info("[graduacoesService] criar", {
    categoriaId,
    nome,
    ordem,
    organizacaoId,
  });

  return graduacoesRepository.criar({
    categoriaId,
    nome,
    ordem,
    organizacaoId,
  });
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar                                                               */
/* -------------------------------------------------------------------------- */
async function atualizar(id, { nome, ordem, organizacaoId }) {
  logger.info("[graduacoesService] atualizar", {
    id,
    nome,
    ordem,
    organizacaoId,
  });

  return graduacoesRepository.atualizar(id, {
    nome,
    ordem,
    organizacaoId,
  });
}

/* -------------------------------------------------------------------------- */
/* ❌ Remover                                                                 */
/* -------------------------------------------------------------------------- */
async function remover(id, organizacaoId) {
  logger.warn("[graduacoesService] remover", { id, organizacaoId });

  return graduacoesRepository.remover(id, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔎 Buscar por ID                                                           */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id, organizacaoId) {
  logger.debug("[graduacoesService] buscarPorId", {
    id,
    organizacaoId,
  });

  return graduacoesRepository.buscarPorId(id, organizacaoId);
}

module.exports = {
  listarPorCategoria,
  listarTodas,
  criar,
  atualizar,
  remover,
  buscarPorId,
};

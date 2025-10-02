// modules/graduacoes/graduacoesRepository.js
const db = require("../../database/connection");
const { logger } = require("../../utils/logger");

// Lista graduações por categoria_id
async function listarPorCategoria(categoriaId) {
  logger.info("[graduacoesRepository] Listando graduações para categoria_id:", categoriaId);

  const [rows] = await db.execute(
    "SELECT id, nome, ordem FROM graduacoes WHERE categoria_id = ? ORDER BY ordem",
    [categoriaId]
  );

  logger.debug("[graduacoesRepository] Retorno da query:", rows);
  return rows;
}

// Lista todas as graduações
async function listarTodas() {
  logger.info("[graduacoesRepository] Listando todas as graduações");

  const [rows] = await db.execute(
    `SELECT g.id, g.nome, g.ordem, c.nome AS categoria, g.categoria_id
     FROM graduacoes g
     JOIN categorias c ON g.categoria_id = c.id
     ORDER BY g.categoria_id, g.ordem`
  );

  logger.debug("[graduacoesRepository] Retorno da query:", rows);
  return rows;
}

module.exports = { listarPorCategoria, listarTodas };

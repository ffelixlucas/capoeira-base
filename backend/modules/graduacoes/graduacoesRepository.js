// modules/graduacoes/graduacoesRepository.js
const db = require("../../database/connection");
const { logger } = require("../../utils/logger");

/* -------------------------------------------------------------------------- */
/* 🔍 Listar por categoria                                                    */
/* -------------------------------------------------------------------------- */
async function listarPorCategoria(categoriaId, organizacaoId) {
  logger.debug("[graduacoesRepository] listarPorCategoria", {
    categoriaId,
    organizacaoId,
  });

  const [rows] = await db.execute(
    `SELECT id, nome, ordem
     FROM graduacoes
     WHERE categoria_id = ?
       AND organizacao_id = ?
     ORDER BY ordem ASC`,
    [categoriaId, organizacaoId]
  );

  return rows;
}

/* -------------------------------------------------------------------------- */
/* 🔍 Listar todas (com nome da categoria)                                    */
/* -------------------------------------------------------------------------- */
async function listarTodas(organizacaoId) {
  logger.debug("[graduacoesRepository] listarTodas", { organizacaoId });

  const [rows] = await db.execute(
    `
      SELECT 
        g.id,
        g.nome,
        g.ordem,
        g.categoria_id,
        c.nome AS categoria
      FROM graduacoes g
      JOIN categorias c 
        ON c.id = g.categoria_id
       AND c.organizacao_id = ?
      WHERE g.organizacao_id = ?
      ORDER BY g.categoria_id, g.ordem ASC
    `,
    [organizacaoId, organizacaoId]
  );

  return rows;
}

/* -------------------------------------------------------------------------- */
/* ➕ Criar graduação                                                          */
/* -------------------------------------------------------------------------- */
async function criar({ nome, ordem, categoriaId, organizacaoId }) {
  logger.info("[graduacoesRepository] criar", {
    nome,
    ordem,
    categoriaId,
    organizacaoId,
  });

  const [result] = await db.execute(
    `INSERT INTO graduacoes (nome, ordem, categoria_id, organizacao_id)
     VALUES (?, ?, ?, ?)`,
    [nome, ordem, categoriaId, organizacaoId]
  );

  return result.insertId;
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar (com validação de organização)                                */
/* -------------------------------------------------------------------------- */
async function atualizar(id, { nome, ordem, organizacaoId }) {
  logger.info("[graduacoesRepository] atualizar", {
    id,
    nome,
    ordem,
    organizacaoId,
  });

  const [result] = await db.execute(
    `
      UPDATE graduacoes
         SET nome = ?, ordem = ?
       WHERE id = ?
         AND organizacao_id = ?
    `,
    [nome, ordem, id, organizacaoId]
  );

  return result.affectedRows > 0;
}

/* -------------------------------------------------------------------------- */
/* ❌ Remover (com validação de organização)                                  */
/* -------------------------------------------------------------------------- */
async function remover(id, organizacaoId) {
  logger.warn("[graduacoesRepository] remover", { id, organizacaoId });

  const [result] = await db.execute(
    `DELETE FROM graduacoes 
      WHERE id = ? 
        AND organizacao_id = ?`,
    [id, organizacaoId]
  );

  return result.affectedRows > 0;
}

/* -------------------------------------------------------------------------- */
/* 🔎 Buscar por ID (isolado por organização)                                 */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id, organizacaoId) {
  logger.debug("[graduacoesRepository] buscarPorId", { id, organizacaoId });

  const [rows] = await db.execute(
    `
      SELECT id, nome, ordem, categoria_id, organizacao_id
        FROM graduacoes
       WHERE id = ?
         AND organizacao_id = ?
    `,
    [id, organizacaoId]
  );

  return rows[0] || null;
}

module.exports = {
  listarPorCategoria,
  listarTodas,
  criar,
  atualizar,
  remover,
  buscarPorId,
};

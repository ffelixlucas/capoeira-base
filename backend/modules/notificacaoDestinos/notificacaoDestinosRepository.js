// modules/notificacaoDestinos/notificacaoDestinosRepository.js
const db = require("../../database/connection");
const logger = require("../../utils/logger");

/**
 * Lista e-mails de notificação por grupo e tipo (multi-organização)
 */
async function listarPorTipo(organizacaoId, grupoId, tipo) {
  logger.debug(
    `[notificacaoDestinosRepository] org ${organizacaoId} - listando tipo ${tipo}`
  );

  const [rows] = await db.execute(
    `SELECT id, email 
     FROM notificacao_destinos 
     WHERE organizacao_id = ? AND grupo_id = ? AND tipo = ? 
     ORDER BY id`,
    [organizacaoId, grupoId, tipo]
  );

  return rows;
}

/**
 * Cria um novo e-mail de notificação
 */
async function criar(organizacaoId, grupoId, tipo, email) {
  const [result] = await db.execute(
    `INSERT INTO notificacao_destinos (organizacao_id, grupo_id, tipo, email) 
     VALUES (?, ?, ?, ?)`,
    [organizacaoId, grupoId, tipo, email]
  );

  logger.info(
    `[notificacaoDestinosRepository] org ${organizacaoId} - novo destino criado (${email})`
  );

  return { id: result.insertId, organizacao_id: organizacaoId, grupo_id: grupoId, tipo, email };
}

/**
 * Remove um e-mail de notificação
 */
async function remover(id, organizacaoId) {
  await db.execute(
    "DELETE FROM notificacao_destinos WHERE id = ? AND organizacao_id = ?",
    [id, organizacaoId]
  );

  logger.warn(
    `[notificacaoDestinosRepository] org ${organizacaoId} - notificação removida id ${id}`
  );
  return true;
}

module.exports = { listarPorTipo, criar, remover };

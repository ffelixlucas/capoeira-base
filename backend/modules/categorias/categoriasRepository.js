// modules/categorias/categoriasRepository.js
const db = require("../../database/connection");
const { logger } = require("../../utils/logger");

// Lista todas as categorias
async function listarTodas() {
  logger.info("[categoriasRepository] Listando todas as categorias");

  const [rows] = await db.execute(
    "SELECT id, nome FROM categorias ORDER BY id ASC"
  );

  logger.debug("[categoriasRepository] Retorno da query:", rows);
  return rows;
}

module.exports = { listarTodas };

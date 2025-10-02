// modules/categorias/categoriasService.js
const categoriasRepository = require("./categoriasRepository");
const { logger } = require("../../utils/logger");

async function listarTodas() {
  logger.info("[categoriasService] Chamando listarTodas");
  return await categoriasRepository.listarTodas();
}

module.exports = { listarTodas };

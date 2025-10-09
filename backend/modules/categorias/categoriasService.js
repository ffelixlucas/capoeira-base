// modules/categorias/categoriasService.js
const categoriasRepository = require("./categoriasRepository");
const { logger } = require("../../utils/logger");

async function listarTodas() {
  logger.info("[categoriasService] Chamando listarTodas");
  return await categoriasRepository.listarTodas();
}

async function buscarPorIdade(idade) {
  logger.info("[categoriasService] Chamando buscarPorIdade");
  return await categoriasRepository.buscarPorIdade(idade);
}

module.exports = { listarTodas, buscarPorIdade };

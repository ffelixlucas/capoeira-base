const logger = require("../../utils/logger.js");

try {
  logger.debug("[familiaRoutes] Carregando módulo compilado (dist)...");
  const modulo = require("../../dist/modules/familia/familiaRoutes.js").default;

  logger.info("[familiaRoutes] Ponte carregada com sucesso! 🚀");
  module.exports = modulo;
} catch (err) {
  logger.error("[familiaRoutes] Erro ao carregar módulo compilado:", err);
  throw err;
}

// Ponte para o arquivo compilado pelo TypeScript
const logger = require("../../utils/logger.js");

try {
  logger.debug("[horariosRoutes] Carregando módulo compilado (dist)...");
  const modulo = require("../../dist/modules/horarios/horariosRoutes.js").default;

  logger.info("[horariosRoutes] Ponte carregada com sucesso! 🚀");
  module.exports = modulo;

} catch (err) {
  logger.error("[horariosRoutes] Erro ao carregar módulo compilado:", err);
  throw err;
}

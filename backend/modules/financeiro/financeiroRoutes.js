// Ponte para o arquivo compilado (TypeScript -> dist)
const logger = require("../../utils/logger.js");
logger.debug("[financeiroRoutes bridge] carregando rota compilada");

module.exports = require("../../dist/modules/financeiro/financeiroRoutes.js").default;

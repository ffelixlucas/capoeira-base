// Ponte para o arquivo compilado (TypeScript -> dist)
const logger = require("../../utils/logger.js");
logger.debug("[pedidosRoutes bridge] carregando rota compilada");

module.exports = require("../../dist/modules/pedidos/pedidosRoutes.js").default;

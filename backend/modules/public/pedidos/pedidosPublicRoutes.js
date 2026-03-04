// Ponte para o arquivo compilado (TypeScript -> dist)
const logger = require("../../../utils/logger.js");
logger.debug("[pedidosPublicRoutes bridge] carregando rota compilada");

module.exports = require("../../../dist/modules/public/pedidos/pedidosPublicRoutes.js").default;

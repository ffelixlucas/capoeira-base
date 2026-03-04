// Ponte para o arquivo compilado (TypeScript -> dist)
const logger = require("../../utils/logger.js");
logger.debug("[pagamentosRoutes bridge] carregando rota compilada");

module.exports = require("../../dist/modules/pagamentos/pagamentosRoutes").default;

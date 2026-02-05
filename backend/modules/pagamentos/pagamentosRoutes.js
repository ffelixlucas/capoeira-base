// Ponte para o arquivo compilado (TypeScript → dist)
console.log("[pagamentos] ponte JS carregada");

module.exports = require("../../dist/modules/pagamentos/pagamentosRoutes").default;

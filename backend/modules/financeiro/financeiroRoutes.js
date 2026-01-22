// Ponte para o arquivo compilado (TypeScript → dist)
console.log("[financeiro] ponte JS carregada");

module.exports = require("../../dist/modules/financeiro/financeiroRoutes.js").default;

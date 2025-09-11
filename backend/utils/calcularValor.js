// utils/calcularValor.js
const TAXA_CARTAO = 0.0499; // 4.99% (ajuste se necessário)

function calcularValorComTaxa(valorBase, metodoPagamento) {
  if (metodoPagamento === "cartao") {
    return parseFloat((valorBase / (1 - TAXA_CARTAO)).toFixed(2));
  }
  return valorBase;
}

module.exports = { calcularValorComTaxa };

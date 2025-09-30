// utils/calcularValor.js
const TAXA_CARTAO = 0.0499; // 4,99%
const TAXA_BOLETO = 3.49;   // fixo

function calcularValores(valorBase) {
  const valor = Number(valorBase);

  return {
    pix: valor,
    cartao: parseFloat((valor / (1 - TAXA_CARTAO)).toFixed(2)),
    boleto: parseFloat((valor + TAXA_BOLETO).toFixed(2)),
  };
}

// 🔥 Nova função que o service está usando
function calcularValorComTaxa(valorBase, metodo) {
  const valores = calcularValores(valorBase);
  return valores[metodo] ?? valorBase;
}

module.exports = { calcularValores, calcularValorComTaxa };

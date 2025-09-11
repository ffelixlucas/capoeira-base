const TAXA_CARTAO = 0.0499;

export function calcularValorComTaxa(valorBase, metodoPagamento) {
  if (metodoPagamento === "cartao") {
    return parseFloat((valorBase / (1 - TAXA_CARTAO)).toFixed(2));
  }
  return valorBase;
}

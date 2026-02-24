// src/utils/validacoes.js

export const validarProdutoBase = (dados) => {
  const erros = {}

  if (!dados.nome?.trim()) {
    erros.nome = 'Nome do produto é obrigatório'
  }

  if (!dados.categoria?.trim()) {
    erros.categoria = 'Categoria é obrigatória'
  }

  if (!dados.tipo_produto) {
    erros.tipo_produto = 'Tipo do produto é obrigatório'
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros
  }
}

/**
 * Validar criação de SKU manual
 */
export const validarSku = (dados) => {
  const erros = {}

  if (!dados.sku_codigo?.trim()) {
    erros.sku_codigo = 'Código do SKU é obrigatório'
  }

  if (!dados.preco || Number(dados.preco) <= 0) {
    erros.preco = 'Preço deve ser maior que zero'
  }

  if (dados.pronta_entrega && dados.encomenda) {
    erros.pronta_entrega =
      'Não é possível selecionar pronta entrega e encomenda juntos'
    erros.encomenda =
      'Não é possível selecionar pronta entrega e encomenda juntos'
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros
  }
}

/**
 * Validar ajuste de estoque
 */
export const validarEstoque = (dados) => {
  const erros = {}

  if (!dados.skuId) {
    erros.skuId = 'Selecione um SKU'
  }

  if (!dados.quantidade || Number(dados.quantidade) <= 0) {
    erros.quantidade = 'Quantidade deve ser maior que zero'
  }

  if (!dados.motivo?.trim()) {
    erros.motivo = 'Motivo é obrigatório'
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros
  }
}
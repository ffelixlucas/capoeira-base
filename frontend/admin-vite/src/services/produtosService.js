import api from '../services/api'

export const produtosService = {

  // 🔵 LISTAR PRODUTOS
  listar: async () => {
    const response = await api.get('/produtos')
    return response.data.data
  },

  // 🔵 BUSCAR PRODUTO POR ID
  buscarPorId: async (id) => {
    const response = await api.get(`/produtos/${id}`)
    return response.data.data
  },

  // 🔵 CRIAR PRODUTO (simples ou variável)
  criar: async (dados) => {
    const response = await api.post('/produtos', dados)
    return response.data
  },

  // 🔵 CRIAR SKU (produto variável)
  criarSku: async (dados) => {
    const response = await api.post('/produtos/sku', dados)
    return response.data
  },

  // 🔵 ATUALIZAR PRODUTO COMPLETO (nome, descrição, preço, estoque)
  atualizar: async (id, dados) => {
    const response = await api.put(`/produtos/${id}`, dados)
    return response.data
  },

  // 🔵 GERAR SKUS PARA PRODUTO VARIÁVEL
  gerarSkus: async (produtoId, dados) => {
    const response = await api.post(
      `/produtos/${produtoId}/gerar-skus`,
      dados
    )
    return response.data
  },
  // 🔵 ATUALIZAR SKU (preço)
atualizarSku: async (skuId, dados) => {
  const response = await api.put(`/produtos/sku/${skuId}`, dados)
  return response.data
},

// 🔵 ATUALIZAR ESTOQUE
atualizarEstoque: async (skuId, dados) => {
  const response = await api.put(`/produtos/sku/${skuId}/estoque`, dados)
  return response.data
},
}


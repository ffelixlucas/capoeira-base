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

// 🔵 UPLOAD IMAGEM PRODUTO
uploadImagemProduto: async (produtoId, file) => {
  const formData = new FormData();
  formData.append("imagem", file);

  const response = await api.post(
    `/produtos/${produtoId}/imagens`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
},

// 🔵 DEFINIR CAPA PRODUTO
definirCapaProduto: async (produtoId, imagemId) => {
  const response = await api.put(
    `/produtos/${produtoId}/imagens/${imagemId}/capa`
  );

  return response.data;
},

// 🔵 REMOVER IMAGEM PRODUTO
removerImagemProduto: async (imagemId) => {
  const response = await api.delete(
    `/produtos/imagens/${imagemId}`
  );

  return response.data;
},

// 🔵 UPLOAD IMAGEM SKU
uploadImagemSku: async (skuId, file) => {
  const formData = new FormData();
  formData.append("imagem", file);

  const response = await api.post(
    `/produtos/sku/${skuId}/imagens`,
    formData
  );

  return response.data;
},

// 🔵 DEFINIR CAPA SKU
definirCapaSku: async (skuId, imagemId) => {
  const response = await api.put(
    `/produtos/sku/${skuId}/imagens/${imagemId}/capa`
  );

  return response.data;
},

// 🔵 REMOVER IMAGEM SKU
removerImagemSku: async (imagemId) => {
  const response = await api.delete(
    `/produtos/sku/imagens/${imagemId}`
  );

  return response.data;
},
}


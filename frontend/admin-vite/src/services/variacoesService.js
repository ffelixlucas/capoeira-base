import api from './api'

export const variacoesService = {

  /* ===============================
     LISTAR
  =============================== */

  async listarTipos() {
    const response = await api.get('/produtos/variacoes/tipos')
    return response.data.data
  },

  async listarValores(tipoId) {
    const response = await api.get(`/produtos/variacoes/valores/${tipoId}`)
    return response.data.data
  },

  /* ===============================
     CRIAR TIPO
  =============================== */

  async criarTipo(payload) {
    const response = await api.post('/produtos/variacoes/tipos', payload)
    return response.data
  },

  /* ===============================
     EXCLUIR TIPO
  =============================== */

  async excluirTipo(tipoId) {
    const response = await api.delete(`/produtos/variacoes/tipos/${tipoId}`)
    return response.data
  },

  /* ===============================
     CRIAR VALOR
  =============================== */

  async criarValor(payload) {
    const response = await api.post('/produtos/variacoes/valores', payload)
    return response.data
  },

  /* ===============================
     EXCLUIR VALOR
  =============================== */

  async excluirValor(valorId) {
    const response = await api.delete(`/produtos/variacoes/valores/${valorId}`)
    return response.data
  }

}
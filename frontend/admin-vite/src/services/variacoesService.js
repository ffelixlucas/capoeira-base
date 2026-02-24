import api from './api'

export const variacoesService = {

  async listarTipos() {
    const response = await api.get('/produtos/variacoes/tipos')
    return response.data.data
  },

  async listarValores(tipoId) {
    const response = await api.get(`/produtos/variacoes/valores/${tipoId}`)
    return response.data.data
  }

}
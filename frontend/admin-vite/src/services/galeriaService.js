// galeriaService.js
import api from './api';

export const uploadImagem = async (formData) => {
  const response = await api.post('/galeria/upload', formData);
  return response.data;
};

export const listarImagens = async () => {
  const response = await api.get('/galeria');
  return response.data;
};

export const deletarImagem = async (id) => {
  const response = await api.delete(`/galeria/${id}`);
  return response.data;
};

export const atualizarOrdem = async (lista) => {
  const response = await api.put('/galeria/ordem', { ordem: lista });
  return response.data;
};

export const atualizarLegenda = async (id, legenda) => {
  const response = await api.put(`/galeria/${id}`, { legenda });
  return response.data;
};
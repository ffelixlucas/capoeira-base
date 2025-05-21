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

// Em breve
export const atualizarOrdem = async (lista) => {
  const response = await api.put('/galeria/ordem', lista);
  return response.data;
};

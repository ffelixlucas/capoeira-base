import api from './api';

export const uploadImagem = async (formData) => {
  const response = await api.post('/galeria/upload', formData);
  return response.data;
};

export const listarImagens = async () => {
  const response = await api.get('/galeria');
  return response.data;
};

import api from './api';

export const listarEventos = async () => {
  const response = await api.get('/agenda');
  return response.data;
};

export const criarEvento = async (dados, token) => {
  const response = await api.post('/agenda', dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const criarEventoComImagem = async (formData, token) => {
  const response = await api.post('/agenda/upload-imagem', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const excluirEvento = async (id, token) => {
  const response = await api.delete(`/agenda/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const atualizarEvento = async (id, dados, token) => {
  const response = await api.put(`/agenda/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

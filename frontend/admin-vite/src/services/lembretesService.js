import api from './api';

// Listar todos ou só pendentes
export const listarLembretes = async (status = '') => {
  const response = await api.get(`/lembretes${status ? `?status=${status}` : ''}`);
  return response.data;
};

// Criar novo lembrete
export const criarLembrete = async (dados) => {
  const response = await api.post('/lembretes', dados);
  return response.data;
};

// Atualizar lembrete
export const atualizarLembrete = async (id, dados) => {
  const response = await api.put(`/lembretes/${id}`, dados);
  return response.data;
};

// Excluir lembrete
export const excluirLembrete = async (id) => {
  const response = await api.delete(`/lembretes/${id}`);
  return response.data;
};

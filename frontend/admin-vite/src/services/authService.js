import api from './api';

export const fazerLogin = async (email, senha) => {
  const response = await api.post('/auth/login', { email, senha });
  return response.data;
};

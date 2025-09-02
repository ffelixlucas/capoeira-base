import api from './api';

export const fazerLogin = async (email, senha) => {
  const response = await api.post('/auth/login', { email, senha });
  return response.data;
};

// solicitar link de redefinição de senha
export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// redefinir senha com token
export const resetPassword = async (token, novaSenha) => {
  const response = await api.post('/auth/reset-password', { token, novaSenha });
  return response.data;
};

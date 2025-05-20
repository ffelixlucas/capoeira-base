import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // prefixo comum a todas as rotas
});

// Intercepta todas as requisições e insere o token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

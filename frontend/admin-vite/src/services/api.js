import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// ✅ Intercepta todas as requisições para inserir o token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercepta todas as respostas para tratar erro 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Token expirado ou inválido. Fazendo logout...');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login'; // ⬅️ Redireciona para login na mão
    }
    return Promise.reject(error);
  }
);

export default api;

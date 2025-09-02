// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const redirectToLogin = () => {
  try {
    sessionStorage.setItem("auth.message", "expired");
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?next=${next}`;
  } catch {
    window.location.href = `/login`;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      console.warn("Sessão inválida/expirada. Redirecionando para login...");
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      redirectToLogin();
      // impede que o erro continue pros componentes (evita toasts locais)
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

export default api;

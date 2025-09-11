// src/services/api.js
import axios from "axios";
import { logger } from "../utils/logger";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const isOnLogin = () => window.location.pathname.startsWith("/login");

const redirectToLogin = () => {
  if (isOnLogin()) return; // evita loop em /login
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
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
        logger.warn("Sessão inválida/expirada. Redirecionando para login...");
      
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      redirectToLogin();
      return new Promise(() => {}); 
    }

    return Promise.reject(error);
  }
);

export default api;

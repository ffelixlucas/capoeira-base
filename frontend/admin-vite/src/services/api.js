import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  
  baseURL: import.meta.env.VITE_API_URL,
});

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
    if (error.response) {
      if (error.response.status === 401) {
        console.warn("Sessão expirada. Fazendo logout...");
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "/login";
      } else if (error.response.status === 403) {
        toast.error("Você não tem permissão para realizar esta ação.");
      }
    }

    return Promise.reject(error);
    
  }
);

export default api;

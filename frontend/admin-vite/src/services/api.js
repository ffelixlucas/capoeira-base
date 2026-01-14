// src/services/api.js
import axios from "axios";
import { logger } from "../utils/logger";

/**
 * Serviço global de API com interceptors, logs e controle de sessão.
 * Padrão multi-organização Capoeira Base.
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

// ----------------------------------------------------
// 🧭 Helpers
// ----------------------------------------------------
const isOnLogin = () => window.location.pathname.startsWith("/login");

const redirectToLogin = () => {
  if (isOnLogin()) return; // evita loop em /login

  try {
    sessionStorage.setItem("auth.message", "expired");
    const next = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    logger.info(`[api] Redirecionando para /login?next=${next}`);
    window.location.href = `/login?next=${next}`;
  } catch (err) {
    logger.error("[api] Erro ao redirecionar:", err);
    window.location.href = `/login`;
  }
};

// ----------------------------------------------------
// 🔹 Interceptor de Requisição
// ----------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("usuario");
    const org = JSON.parse(user || "{}")?.organizacao_id || "desconhecida";

    if (token) config.headers.Authorization = `Bearer ${token}`;
    logger.debug(`[api] → ${config.method?.toUpperCase()} ${config.url}`, {
      org,
      headers: config.headers,
      params: config.params || {},
      data: config.data || {},
    });

    return config;
  },
  (error) => {
    logger.error("[api] Erro na configuração da requisição:", error);
    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// 🔸 Interceptor de Resposta
// ----------------------------------------------------
api.interceptors.response.use(
  (response) => {
    const url = response.config?.url;
    const method = response.config?.method?.toUpperCase();
    const status = response.status;

    logger.debug(`[api] ← ${method} ${url} [${status}]`, response.data);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "URL desconhecida";
    const method = error?.config?.method?.toUpperCase() || "GET";
    const isProtected = !url.includes("/public/");
    const isAuthRoute = url.includes("/auth/");
    const message = error?.response?.data?.message || error.message;

    logger.warn(
      `[api] ⚠️ Erro em ${method} ${url} → ${
        status || "sem status"
      } | ${message}`
    );

    // Ignora erro de perfil durante boot inicial
    const isPerfilRequest =
      url.includes("/equipe/perfil") || url.includes("/perfil");
    if (isPerfilRequest && (status === 401 || status === 403)) {
      logger.warn(
        "[api] Ignorando 401/403 de buscarPerfil durante inicialização"
      );
      return Promise.reject(error);
    }

    // 🔐 Sessão expirada (evita derrubar logo após login)
    if (
      (status === 401 || status === 403) &&
      isProtected &&
      !isAuthRoute &&
      !isOnLogin()
    ) {
      if (!localStorage.getItem("token")) {
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    // ⚠️ Outros erros genéricos
    if (status >= 500) {
      logger.error(`[api] Erro de servidor [${status}] em ${url}`);
    }

    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// ✅ Exporta instância
// ----------------------------------------------------
export default api;

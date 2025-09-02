import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { fazerLogin } from "../services/authService";
import { buscarPerfil } from "../services/equipeService";

export const AuthContext = createContext(null);

function decodeJwtExp(token) {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(atob(payload));
    return typeof json?.exp === "number" ? json.exp : null; // em segundos
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [logoutTimer, setLogoutTimer] = useState(null);

  // ✅ Função única para redirecionar com UX consistente
  const redirectToLogin = () => {
    // mensagem será lida na tela de login para exibir um toast “Sessão expirada”
    sessionStorage.setItem("auth.message", "expired");
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/login?next=${next}`;
  };

  // ✅ Sempre limpar tudo de forma consistente
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken("");
    setUsuario(null);
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  };

  // ✅ Programa logout automático na hora do exp do JWT (se existir)
  const scheduleAutoLogout = (jwt) => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
    const exp = decodeJwtExp(jwt); // segundos desde epoch
    if (!exp) return;

    const msUntilExp = exp * 1000 - Date.now();
    if (msUntilExp <= 0) {
      // já expirado
      logout();
      redirectToLogin();
      return;
    }
    const id = setTimeout(() => {
      logout();
      redirectToLogin();
    }, msUntilExp);
    setLogoutTimer(id);
  };

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");

    if (tokenSalvo) {
      setToken(tokenSalvo);
      scheduleAutoLogout(tokenSalvo);

      // 🔥 Buscar perfil atualizado no backend
      buscarPerfil()
        .then((dados) => {
          setUsuario(dados);
          localStorage.setItem("usuario", JSON.stringify(dados));
          console.log("📌 Perfil atualizado:", dados);
        })
        .catch((err) => {
          console.error("Erro ao carregar perfil:", err);
          logout();
          redirectToLogin();
        })
        .finally(() => setCarregando(false));
    } else {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // ✅ Interceptor global: 401/403 → fluxo único (logout + redirect)
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          logout();
          redirectToLogin();
          // impede que os componentes mostrem "sem permissão" por cima
          return new Promise(() => {}); // pendura a promise (evita toasts locais)
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, senha) => {
    try {
      // login só retorna token
      const { token: tk } = await fazerLogin(email, senha);
      localStorage.setItem("token", tk);
      setToken(tk);
      scheduleAutoLogout(tk);

      // 🔥 buscar perfil completo com roles/telefone/whatsapp
      const perfil = await buscarPerfil();
      localStorage.setItem("usuario", JSON.stringify(perfil));
      setUsuario(perfil);

      return { sucesso: true };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return {
        sucesso: false,
        mensagem: error.response?.data?.message || "Erro desconhecido",
      };
    }
  };

  const isAutenticado = () => !!token;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        isAutenticado,
        carregando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

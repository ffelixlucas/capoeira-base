import React, { createContext, useState, useEffect, useContext } from "react";
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

  const redirectToLogin = () => {
    sessionStorage.setItem("auth.message", "expired");
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = `/login?next=${next}`;
    }
  };

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

  const scheduleAutoLogout = (jwt) => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
    const exp = decodeJwtExp(jwt); // segundos desde epoch
    if (!exp) return;

    const msUntilExp = exp * 1000 - Date.now();
    if (msUntilExp <= 0) {
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

      buscarPerfil()
        .then((dados) => {
          setUsuario(dados);
          localStorage.setItem("usuario", JSON.stringify(dados));
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log("📌 Perfil atualizado:", dados);
          }
        })
        .catch(() => {
          // não expor erro detalhado ao usuário aqui
          logout();
          redirectToLogin();
        })
        .finally(() => setCarregando(false));
    } else {
      setCarregando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, senha) => {
    try {
      const { token: tk } = await fazerLogin(email, senha);
      localStorage.setItem("token", tk);
      setToken(tk);
      scheduleAutoLogout(tk);

      const perfil = await buscarPerfil();
      localStorage.setItem("usuario", JSON.stringify(perfil));
      setUsuario(perfil);

      return { sucesso: true };
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Erro ao fazer login:", error);
      }
      return {
        sucesso: false,
        mensagem: error?.response?.data?.message || "Erro ao fazer login",
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

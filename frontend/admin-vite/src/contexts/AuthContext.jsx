import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { fazerLogin } from "../services/authService";
import { buscarPerfil } from "../services/equipeService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    const tokenSalvo = localStorage.getItem("token");

    if (tokenSalvo) {
      setToken(tokenSalvo);

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
        })
        .finally(() => setCarregando(false));
    } else {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    // Interceptor para capturar erros 401/403 e deslogar
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          window.location.href = "/login";
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, senha) => {
    try {
      // login só retorna token
      const { token } = await fazerLogin(email, senha);
      localStorage.setItem("token", token);
      setToken(token);

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

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setToken("");
    setUsuario(null);
  };

  const isAutenticado = () => {
    return !!token;
  };

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

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { fazerLogin } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    // Recupera dados salvos ao carregar
    const tokenSalvo = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }

    setCarregando(false);
  }, []);

  useEffect(() => {
    // Interceptor para capturar erros 401/403 e deslogar
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout(); // limpa token e usuário
          window.location.href = "/login"; // redireciona pro login
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
      const { token, usuario } = await fazerLogin(email, senha);
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      setToken(token);
      setUsuario(usuario);
      return { sucesso: true };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return {
        sucesso: false,
        mensagem: error.response?.data?.message || 'Erro desconhecido'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken('');
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

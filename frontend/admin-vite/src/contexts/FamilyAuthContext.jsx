import React, { createContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import {
  buscarPerfilFamilia,
  loginFamiliaComFirebase,
  TOKEN_KEY,
} from "../services/familiaPortalService";

const USER_KEY = "familia.usuario";

const FamilyAuthContext = createContext(null);

export function FamilyAuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [usuario, setUsuario] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [carregando, setCarregando] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setCarregando(false);
      return;
    }

    buscarPerfilFamilia()
      .then((perfil) => {
        setUsuario(perfil);
        localStorage.setItem(USER_KEY, JSON.stringify(perfil));
      })
      .catch(() => {
        logout();
      })
      .finally(() => setCarregando(false));
  }, [token]);

  async function loginComFirebase(payload) {
    const resposta = await loginFamiliaComFirebase(payload);
    localStorage.setItem(TOKEN_KEY, resposta.token);
    localStorage.setItem(USER_KEY, JSON.stringify(resposta.usuario));
    setToken(resposta.token);
    setUsuario(resposta.usuario);
    return resposta.usuario;
  }

  async function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUsuario(null);
    try {
      await signOut(auth);
    } catch {
      // noop
    }
  }

  return (
    <FamilyAuthContext.Provider
      value={{
        token,
        usuario,
        carregando,
        autenticado: Boolean(token),
        loginComFirebase,
        logout,
      }}
    >
      {children}
    </FamilyAuthContext.Provider>
  );
}

export { FamilyAuthContext };

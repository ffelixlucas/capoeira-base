import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAutenticado, carregando } = useAuth();

  // 🔥 Loading bonitão enquanto verifica autenticação
  if (carregando) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-cor-fundo">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cor-primaria"></div>
        <p className="mt-4 text-lg text-cor-titulo">Verificando acesso...</p>
      </div>
    );
  }

  // 🔐 Se autenticado → libera
  return isAutenticado() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function RoleRoute({ children, permitido }) {
  const { usuario } = useAuth();

  if (!usuario || !usuario.roles) return <Navigate to="/login" />;

  const temPermissao = permitido.some((p) => usuario.roles.includes(p));

  return temPermissao ? children : <Navigate to="/nao-autorizado" />;
}

export default RoleRoute;

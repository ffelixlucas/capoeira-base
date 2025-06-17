import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAutenticado, carregando } = useAuth();

  if (carregando) {
    return <p>Carregando...</p>;
  }

  return isAutenticado() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

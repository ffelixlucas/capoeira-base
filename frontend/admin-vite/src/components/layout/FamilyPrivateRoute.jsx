import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useFamilyAuth } from "../../hooks/useFamilyAuth";

export default function FamilyPrivateRoute({ children }) {
  const { slug } = useParams();
  const { autenticado, carregando, usuario } = useFamilyAuth();

  if (carregando) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
        Carregando portal da família...
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to={`/familia/${slug}/login`} replace />;
  }

  if (usuario?.slug && slug && usuario.slug !== slug) {
    return <Navigate to={`/familia/${usuario.slug}`} replace />;
  }

  return children;
}

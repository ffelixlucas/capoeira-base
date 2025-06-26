import React from "react";
import { useNavigate } from "react-router-dom";

export default function NaoAutorizado() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="rounded-xl border p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          🚫 Acesso Negado
        </h1>
        <p className="text-gray-700">
          Você não tem permissão para acessar esta página.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

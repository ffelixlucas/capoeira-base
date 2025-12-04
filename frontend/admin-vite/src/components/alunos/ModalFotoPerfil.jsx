// src/components/alunos/ModalFotoPerfil.jsx
import React from "react";
import ReactDOM from "react-dom";
import FotoPerfil from "../ui/FotoPerfil";

export default function ModalFotoPerfil({ aberto, onClose, onConfirm }) {
  if (!aberto) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999999] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-5 max-w-md w-full">
        <h2 className="text-lg font-semibold text-center mb-3">
          Alterar foto do aluno
        </h2>

        <FotoPerfil
          value={null}
          onChange={(e) => {
            if (e?.target?.name === "imagemBase64") {
              onConfirm(e.target.value);
            }
          }}
        />

        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md"
        >
          Cancelar
        </button>
      </div>
    </div>,
    document.body
  );
}

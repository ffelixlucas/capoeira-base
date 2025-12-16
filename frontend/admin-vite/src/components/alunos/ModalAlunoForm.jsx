// ModalAlunoForm.jsx (CORRIGIDO)
import React from "react";
import ReactDOM from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import AlunoForm from "./AlunoForm";

export default function ModalAlunoForm({
  aberto,
  onClose,
  onCriado,
  alunoParaEdicao,
}) {
  if (!aberto) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white w-full h-full md:h-auto md:max-w-lg md:rounded-2xl shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {alunoParaEdicao ? "Editar Aluno" : "Cadastrar Aluno"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-red-500 rounded"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4">
          <AlunoForm
            alunoParaEdicao={alunoParaEdicao}
            onCriado={() => {
              onCriado?.();
              onClose();
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

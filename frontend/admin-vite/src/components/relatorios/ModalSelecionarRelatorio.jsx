import React from "react";

export default function ModalSelecionarRelatorio({ aberto, onClose, onSelecionar }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md rounded-lg p-5 shadow-xl animate-fadeIn relative">

        {/* Título */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Selecionar Relatório
        </h2>

        {/* Lista de relatórios */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelecionar("geral")}
            className="w-full bg-cor-primaria hover:bg-cor-destaque text-black py-2 rounded-md font-medium"
          >
            Relatório Geral de Alunos
          </button>

          <button
            onClick={() => onSelecionar("presencas")}
            className="w-full bg-cor-primaria hover:bg-cor-destaque text-black py-2 rounded-md font-medium"
          >
            Presença por Turma
          </button>

          <button
            onClick={() => onSelecionar("individual")}
            className="w-full bg-cor-primaria hover:bg-cor-destaque text-black py-2 rounded-md font-medium"
          >
            Relatório Individual do Aluno
          </button>

          <button
            onClick={() => onSelecionar("faltas")}
            className="w-full bg-cor-primaria hover:bg-cor-destaque text-black py-2 rounded-md font-medium"
          >
            Faltas Crônicas
          </button>
        </div>

        {/* Fechar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

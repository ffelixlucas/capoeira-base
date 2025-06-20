import React from "react";

function ModalLegenda({ isOpen, onClose, legenda, setLegenda, onSalvar }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-cor-fundo rounded-2xl w-[90%] max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-cor-clara">
          Editar Legenda
        </h2>

        <textarea
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder="Digite a legenda"
          rows={3}
          className="w-full border rounded-lg p-2 mb-4 bg-cor-clara text-cor-escura resize-y"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-cor-secundaria hover:bg-cor-destaque text-cor-clara"
          >
            Cancelar
          </button>
          <button
            onClick={onSalvar}
            className="px-4 py-2 rounded bg-cor-titulo hover:bg-cor-primaria text-cor-escura"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalLegenda;

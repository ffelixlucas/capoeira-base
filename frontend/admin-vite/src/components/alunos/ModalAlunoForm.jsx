// src/components/alunos/ModalAlunoForm.jsx
import { XMarkIcon } from "@heroicons/react/24/outline";
import AlunoForm from "./AlunoForm";

export default function ModalAlunoForm({ aberto, onClose, onCriado, alunoParaEdicao }) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full h-full md:h-auto md:max-w-lg md:rounded-2xl shadow-lg overflow-y-auto">
        
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
            onCriado={() => {
              onCriado?.();
              onClose();
            }}
            alunoParaEdicao={alunoParaEdicao}
          />
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { usePendentes } from "../../hooks/usePendentes";
import { Check, X } from "lucide-react";

function ModalPendentes({
  aberto,
  onClose,
  onAbrirFicha,
  onAtualizarContador,
  onAtualizarAlunos,
}) {
  const { pendentes, carregando, aprovarAluno, rejeitarAluno } = usePendentes();

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full sm:w-11/12 sm:h-[80vh] sm:rounded-lg shadow-lg overflow-y-auto relative flex flex-col">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
          aria-label="Fechar modal"
        >
          ✖
        </button>

        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-center text-gray-800">
            Matrículas Pendentes
          </h2>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 p-4 overflow-y-auto">
          {carregando ? (
            <p className="text-center text-gray-500">Carregando...</p>
          ) : pendentes.length === 0 ? (
            <p className="text-center text-gray-600">
              Nenhuma matrícula pendente.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {pendentes.map((aluno) => (
                <li
                  key={aluno.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 px-2 hover:bg-gray-50"
                >
                  {/* Área clicável para abrir ficha */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => onAbrirFicha?.(aluno)}
                  >
                    <p className="font-medium text-gray-800">
                      {aluno.nome}{" "}
                      {aluno.apelido && (
                        <span className="text-gray-500">({aluno.apelido})</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {aluno.telefone_responsavel || "Sem telefone"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {aluno.email || "Sem email"}
                    </p>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={async () => {
                        await aprovarAluno(aluno.id);
                        onAtualizarContador?.();
                        onAtualizarAlunos?.();
                      }}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm transition"
                    >
                      <Check size={16} />
                      Aprovar
                    </button>
                    <button
                      onClick={async () => {
                        await rejeitarAluno(aluno.id);
                        onAtualizarContador?.();
                        onAtualizarAlunos?.();
                      }}
                      className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-md text-sm transition"
                    >
                      <X size={16} />
                      Rejeitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalPendentes;

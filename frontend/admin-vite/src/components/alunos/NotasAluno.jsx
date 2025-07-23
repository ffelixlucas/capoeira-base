// src/components/alunos/NotasAluno.jsx
import { useEffect, useState } from "react";
import { useNotasAluno } from "../../hooks/useNotasAluno";
import { useAuth } from "../../contexts/AuthContext";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function NotasAluno({ alunoId }) {
  const { usuario } = useAuth();
  const [novaNota, setNovaNota] = useState("");
  const { notas, carregarNotas, adicionarNota, removerNota, carregando } =
    useNotasAluno(alunoId);

    if (!alunoId) return null; 


  useEffect(() => {
    if (alunoId) return;
    carregarNotas();
  }, [alunoId]);

  async function handleAdicionar() {
    if (!novaNota.trim()) return;
    await adicionarNota(novaNota);
    setNovaNota("");
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold mb-2 text-gray-800">
        Observações pessoais
      </h2>

      {/* Campo nova nota */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={novaNota}
          onChange={(e) => setNovaNota(e.target.value)}
          placeholder="Adicionar observação..."
          className="flex-1 border rounded px-3 py-1 text-sm"
        />
        <button
          onClick={handleAdicionar}
          className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
        >
          Salvar
        </button>
      </div>

      {/* Lista de notas */}
      {carregando ? (
        <p className="text-sm text-gray-500">Carregando notas...</p>
      ) : notas.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma anotação ainda.</p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {notas.map((nota) => (
            <li
              key={nota.id}
              className="bg-gray-100 rounded p-2 flex justify-between items-start text-sm"
            >
              <div>
                <p className="text-gray-800">{nota.texto}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(nota.criado_em).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {(nota.equipe_id === usuario.id ||
                usuario.roles.includes("admin")) && (
                <button
                  onClick={() => removerNota(nota.id)}
                  className="text-gray-400 hover:text-red-500 ml-2"
                  title="Excluir nota"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

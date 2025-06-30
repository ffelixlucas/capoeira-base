import React, { useState } from "react";
import { useEquipe } from "../../hooks/useEquipe";
import EquipeForm from "./EquipeForm";
import { useAuth } from "../../contexts/AuthContext";
import { removerMembro } from "../../services/equipeService";
import { toast } from "react-toastify";

function EquipeList({ membros, loading, erro, onAtualizar }) {
  const { usuario } = useAuth();
  const [expandido, setExpandido] = useState(null);
  const [membroEditando, setMembroEditando] = useState(null);

  const handleExcluir = async (membro) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${membro.nome}?`))
      return;
    try {
      await removerMembro(membro.id);
      toast.success("Membro excluído com sucesso");
      onAtualizar();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir membro");
    }
  };

  if (loading) return <p className="text-gray-600">Carregando equipe...</p>;
  if (erro) return <p className="text-red-600">{erro}</p>;

  return (
    <div className="space-y-4">
      {membros.map((membro) => (
        <div
          key={membro.id}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:flex md:justify-between md:items-center"
        >
          <div className="flex-1">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                setExpandido(expandido === membro.id ? null : membro.id)
              }
            >
              <h2 className="text-lg font-bold text-gray-800">{membro.nome}</h2>
              <div className="flex flex-wrap gap-2">
                {membro.roles && membro.roles.length > 0 ? (
                  membro.roles.map((role) => (
                    <span
                      key={role.id}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {role.nome}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-sm">
                    Sem papel
                  </span>
                )}
              </div>
            </div>

            {expandido === membro.id && (
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Telefone:</strong> {membro.telefone || "-"}
                </p>
                <p>
                  <strong>WhatsApp:</strong> {membro.whatsapp || "-"}
                </p>
                <p>
                  <strong>Email:</strong> {membro.email || "-"}
                </p>
                <p>
                  <strong>Status:</strong> {membro.status}
                </p>
                <div className="flex gap-4 pt-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setMembroEditando(membro)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleExcluir(membro)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {membroEditando && (
        <EquipeForm
          membroSelecionado={membroEditando}
          onClose={() => setMembroEditando(null)}
          usuarioLogado={usuario}
        />
      )}
    </div>
  );
}

export default EquipeList;

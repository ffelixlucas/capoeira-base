import React, { useState } from "react";
import { removerMembro } from "../../services/equipeService";
import EquipeForm from "./EquipeForm";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";

/**
 * 🧩 Componente: EquipeList
 * Lista os membros da equipe com opções de edição e exclusão.
 * Usa padrão Capoeira Base v2 (mobile-first + hooks + services).
 */
function EquipeList({ membros, loading, erro, onAtualizar }) {
  const [expandido, setExpandido] = useState(null);
  const [membroEditando, setMembroEditando] = useState(null);

  /* -------------------------------------------------------------------------- */
  /* ❌ Excluir membro                                                          */
  /* -------------------------------------------------------------------------- */
  const handleExcluir = async (membro) => {
    if (!window.confirm(`Tem certeza que deseja excluir ${membro.nome}?`)) return;

    try {
      logger.debug("[EquipeList] Removendo membro", { id: membro.id, nome: membro.nome });
      await removerMembro(membro.id);

      toast.success("Membro excluído com sucesso!");
      onAtualizar?.();

      logger.debug("[EquipeList] Membro removido com sucesso", { id: membro.id });
    } catch (err) {
      logger.error("[EquipeList] Erro ao excluir membro", { id: membro.id, erro: err.message });
      toast.error("Erro ao excluir membro");
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 💾 Ao salvar (edição ou criação)                                          */
  /* -------------------------------------------------------------------------- */
  const handleSave = () => {
    onAtualizar?.();
    setMembroEditando(null);
    setExpandido(null);
  };

  /* -------------------------------------------------------------------------- */
  /* 🧾 Renderização principal                                                  */
  /* -------------------------------------------------------------------------- */
  if (loading) return <p className="text-gray-600">Carregando equipe...</p>;
  if (erro) return <p className="text-red-600">{erro}</p>;
  if (!membros?.length) return <p className="text-gray-500 italic">Nenhum membro encontrado.</p>;

  return (
    <div className="space-y-4">
      {membros.map((membro) => (
        <div
          key={membro.id}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:flex md:justify-between md:items-center transition hover:shadow-md"
        >
          <div className="flex-1">
            {/* Cabeçalho */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandido(expandido === membro.id ? null : membro.id)}
            >
              <h2 className="text-lg font-bold text-gray-800">{membro.nome}</h2>

              {/* Roles */}
              <div className="flex flex-wrap gap-2">
                {membro.roles?.length ? (
                  membro.roles.map((role) => (
                    <span
                      key={role.id}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {role.nome}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic text-sm">Sem papel</span>
                )}
              </div>
            </div>

            {/* Corpo expandido */}
            {expandido === membro.id && (
              <div className="mt-4 space-y-2 text-sm text-gray-700 animate-fadeIn">
                <p><strong>Telefone:</strong> {membro.telefone || "-"}</p>
                <p><strong>WhatsApp:</strong> {membro.whatsapp || "-"}</p>
                <p><strong>Email:</strong> {membro.email || "-"}</p>
                <p><strong>Status:</strong> {membro.status}</p>

                <div className="flex gap-4 pt-2">
                  <button
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => setMembroEditando(membro)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline font-medium"
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

      {/* Modal de edição / criação */}
      {membroEditando && (
        <EquipeForm
          membroSelecionado={membroEditando}
          onClose={() => setMembroEditando(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default EquipeList;

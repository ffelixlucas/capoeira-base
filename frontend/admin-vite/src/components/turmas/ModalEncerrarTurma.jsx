import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { encerrarTurma } from "../../services/turmaService";
import { logger } from "../../utils/logger";

/**
 * 🔁 ModalEncerrarTurma
 * Padrão Capoeira Base v2 — agora detecta automaticamente se a turma está vazia.
 */
export default function ModalEncerrarTurma({ turma, turmas, onClose, onSucesso }) {
  const [destinoId, setDestinoId] = useState(1); // padrão: "Sem turma"
  const [encerrando, setEncerrando] = useState(false);
  const [possuiAlunos, setPossuiAlunos] = useState(true); // assume que sim até verificar

  /* -------------------------------------------------------------------------- */
  /* 🔍 Verificar vínculos antes de exibir o select                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    async function verificarVinculos() {
      try {
        const resposta = await fetch(
          `${import.meta.env.VITE_API_URL}/turmas/${turma.id}/vinculos`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await resposta.json();
        logger.debug("[ModalEncerrarTurma] Verificação de vínculos", data);
        setPossuiAlunos(Boolean(data?.possui_vinculos));
      } catch (err) {
        logger.error("[ModalEncerrarTurma] Erro ao verificar vínculos", {
          erro: err.message,
        });
        // fallback seguro
        setPossuiAlunos(true);
      }
    }

    if (turma?.id) verificarVinculos();
  }, [turma]);

  /* -------------------------------------------------------------------------- */
  /* ⚙️ Confirma encerramento                                                  */
  /* -------------------------------------------------------------------------- */
  async function handleConfirmar() {
    try {
      if (!turma?.id) {
        toast.error("Turma inválida.");
        return;
      }

      setEncerrando(true);

      const destino = possuiAlunos ? destinoId : null;

      logger.debug("[ModalEncerrarTurma] Encerrando turma", {
        origemId: turma.id,
        destinoId: destino,
      });

      await encerrarTurma(turma.id, destino);

      toast.success("Turma encerrada com sucesso!");
      onSucesso?.();
      onClose();
    } catch (err) {
      logger.error("[ModalEncerrarTurma] Erro ao encerrar turma", {
        origemId: turma.id,
        destinoId,
        erro: err.message,
      });
      toast.error(err?.response?.data?.erro || "Erro ao encerrar turma.");
    } finally {
      setEncerrando(false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🧱 Renderização                                                           */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 space-y-4 animate-fadeIn">
        {/* Cabeçalho */}
        <h2 className="text-lg font-semibold text-red-600 text-center">
          Encerrar turma: <span className="font-bold">{turma.nome}</span>
        </h2>

        {/* Exibe aviso apenas se houver alunos */}
        {possuiAlunos ? (
          <>
            <p className="text-sm text-gray-700 text-center">
              Esta turma possui alunos vinculados. Escolha para onde deseja migrá-los:
            </p>

            <select
              value={destinoId}
              onChange={(e) => setDestinoId(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-cor-primaria"
            >
              {[
                { id: 1, nome: "Sem turma" },
                ...turmas.filter((t) => t.id !== turma.id && t.id !== 1),
              ].map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </select>
          </>
        ) : (
          <p className="text-sm text-green-700 text-center font-medium">
            Esta turma está vazia e será encerrada diretamente.
          </p>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={encerrando}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmar}
            disabled={encerrando}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-75"
          >
            {encerrando ? "Encerrando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

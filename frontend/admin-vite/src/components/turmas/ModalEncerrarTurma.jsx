import { useState } from "react";
import { toast } from "react-toastify";
import { encerrarTurma } from "../../services/turmaService";

export default function ModalEncerrarTurma({
  turma,
  turmas,
  onClose,
  onSucesso,
}) {
  const [destinoId, setDestinoId] = useState(1); // padrão: Sem turma
  const [encerrando, setEncerrando] = useState(false);

  async function handleConfirmar() {
    try {
      setEncerrando(true);
      await encerrarTurma(turma.id, destinoId);
      toast.success("Turma encerrada com sucesso.");
      onSucesso?.();
      onClose();
    } catch (err) {
      toast.error("Erro ao encerrar turma.");
    } finally {
      setEncerrando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-lg">
        <h2 className="text-lg font-semibold text-red-600">
          Encerrar turma: {turma.nome}
        </h2>
        <p className="text-sm text-gray-700">
          Esta turma possui alunos vinculados. Escolha para onde deseja
          migrá-los:
        </p>

        <select
          value={destinoId}
          onChange={(e) => setDestinoId(parseInt(e.target.value))}
          className="w-full border rounded-md px-3 py-2 text-black bg-white"
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

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={encerrando}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            {encerrando ? "Encerrando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

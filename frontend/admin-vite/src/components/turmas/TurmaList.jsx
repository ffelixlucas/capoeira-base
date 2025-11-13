import { toast } from "react-toastify";
import { logger } from "../../utils/logger";

/**
 * 🧾 Componente: TurmaList
 * Lista turmas de forma responsiva, com botões de editar e excluir.
 */
export default function TurmaList({ turmas = [], onEditar, onExcluir }) {
  /* -------------------------------------------------------------------------- */
  /* 🔄 Handlers                                                                */
  /* -------------------------------------------------------------------------- */
  const handleEditar = (turma) => {
    try {
      logger.debug("[TurmaList] Editar turma", { id: turma.id, nome: turma.nome });
      onEditar?.(turma);
    } catch (err) {
      logger.error("[TurmaList] Erro ao acionar edição", { erro: err.message });
      toast.error("Erro ao abrir edição da turma");
    }
  };

  const handleExcluir = (turma) => {
    try {
      logger.debug("[TurmaList] Excluir turma", { id: turma.id, nome: turma.nome });
      onExcluir?.(turma);
    } catch (err) {
      logger.error("[TurmaList] Erro ao acionar exclusão", { erro: err.message });
      toast.error("Erro ao excluir turma");
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🧱 Renderização                                                            */
  /* -------------------------------------------------------------------------- */
  if (!turmas.length) {
    return (
      <p className="text-center text-gray-500 mt-4">
        Nenhuma turma cadastrada ainda.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {turmas.map((turma) => (
        <div
          key={turma.id}
          className="relative bg-white rounded-xl shadow p-4 border border-gray-200 transition hover:shadow-md hover:-translate-y-[1px]"
        >
          {/* Cabeçalho */}
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-cor-primaria break-words">
              {turma.nome}
            </h2>
            <div className="flex gap-3">
              {onEditar && (
                <button
                  onClick={() => handleEditar(turma)}
                  className="text-xs text-cor-primaria hover:underline"
                >
                  Editar
                </button>
              )}
              {onExcluir && (
                <button
                  onClick={() => handleExcluir(turma)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Excluir
                </button>
              )}
            </div>
          </div>

          {/* Detalhes */}
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            <p>
              <strong>Faixa etária:</strong>{" "}
              {turma.faixa_etaria || "Não informada"}
            </p>
            {turma.idade_min !== null && turma.idade_max !== null && (
              <p>
                <strong>Idade:</strong> {turma.idade_min} – {turma.idade_max} anos
              </p>
            )}
            {turma.nome_categoria && (
              <p>
                <strong>Categoria:</strong> {turma.nome_categoria}
              </p>
            )}
            <p>
              <strong>Instrutor:</strong>{" "}
              {turma.nome_instrutor || <span className="italic text-gray-400">Não vinculado</span>}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

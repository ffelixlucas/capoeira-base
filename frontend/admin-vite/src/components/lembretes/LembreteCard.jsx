import { TrashIcon } from "@heroicons/react/24/outline";

export default function LembreteCard({
  lembrete,
  podeEditar,
  podeExcluir,
  onEditar,
  onExcluir,
}) {
  const corPrioridade = {
    baixa: "border-gray-300 bg-white",
    media: "border-yellow-400 bg-yellow-50",
    alta: "border-red-500 bg-red-50",
  };

  const estilo = corPrioridade[lembrete.prioridade] || corPrioridade.baixa;
  const feito = lembrete.status === "feito";

  return (
    <div
      className={`rounded-xl border p-3 flex justify-between items-start gap-3 ${estilo}`}
    >
      {/* Caixa de seleção + texto */}
      <div className="flex items-start gap-3 flex-1">
        {podeEditar && (
          <input
            type="checkbox"
            checked={feito}
            onChange={() =>
              onEditar(lembrete.id, {
                ...lembrete,
                status: feito ? "pendente" : "feito",
              })
            }
            className="mt-1 accent-green-600 w-4 h-4 cursor-pointer"
            title="Marcar como feito"
            aria-label="Marcar como feito"
          />
        )}

        <div>
          <p
            className={`text-sm font-medium ${
              feito ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {lembrete.titulo}
          </p>
          {lembrete.descricao && (
            <p
              className={`text-xs mt-1 ${
                feito ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {lembrete.descricao}
            </p>
          )}
          {lembrete.data && (
            <p className="text-xs text-cor-escura/60 mt-1">
              📅 Dia: {new Date(lembrete.data).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </div>

      {/* Ação: excluir */}
      <div className="flex-shrink-0 flex gap-2 items-start mt-1">
        {podeExcluir && (
          <button
            onClick={onExcluir}
            className="text-gray-500 hover:text-red-500"
            aria-label="Excluir lembrete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

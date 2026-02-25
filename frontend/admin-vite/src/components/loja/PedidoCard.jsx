import { useNavigate } from "react-router-dom";
import { obterStatusOperacionalConfig } from "../../utils/lojaStatus";

export default function PedidoCard({ pedido }) {
  const navigate = useNavigate();

  const status = obterStatusOperacionalConfig(
    pedido.status_financeiro === "estornado"
      ? "estornado"
      : pedido.status_operacional
  );

  return (
    <div
      onClick={() => navigate(`/loja/pedido/${pedido.id}`)}
      className="
        group
        bg-surface/80 backdrop-blur-sm
        text-on-surface
        rounded-2xl
        border border-cor-secundaria/20
        p-4 sm:p-5
        transition-all duration-200
        active:scale-[0.98]
        hover:shadow-lg
        hover:border-cor-secundaria/40
        cursor-pointer
      "
    >
      <div className="flex justify-between items-start gap-4">
        {/* ESQUERDA */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Linha superior */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-base sm:text-lg tracking-tight">
              Pedido #{pedido.id}
            </span>

            {/* STATUS BADGE */}
            <span
              className={`
                flex items-center gap-2
                px-3 py-1
                rounded-full
                text-xs font-medium
                ${status.bg}
                ${status.text}
                backdrop-blur-sm
              `}
            >
              <span
                className={`w-2 h-2 rounded-full ${status.dot}`}
              />
              {status.label}
            </span>
          </div>

          {/* Cliente */}
          <div className="text-sm sm:text-base text-on-surface/70 truncate">
            {pedido.nome_cliente}
          </div>
        </div>

        {/* DIREITA */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          <span className="text-base sm:text-lg font-semibold">
            R$ {Number(pedido.valor_total).toFixed(2)}
          </span>

          <span className="text-xs text-on-surface/40">
            {pedido.total_itens || 0} itens
          </span>
        </div>
      </div>
    </div>
  );
}

export default function EventoInfo({ evento }) {
    return (
      <div className="bg-white rounded-xl p-6 text-gray-800 shadow-lg mb-6 border border-gray-200">
        <p className="text-lg font-bold mb-2">
          Data:{" "}
          <span className="text-cor-primaria">
            {new Date(evento.data_inicio).toLocaleDateString("pt-BR")}
          </span>
        </p>
        <p className="text-base font-semibold text-cor-primaria mb-4">
          Investimento: R$ {parseFloat(evento.valor).toFixed(2)}
        </p>
        <p className="text-sm leading-relaxed">
          {evento.descricao_completa || evento.descricao_curta}
        </p>
      </div>
    );
  }
  
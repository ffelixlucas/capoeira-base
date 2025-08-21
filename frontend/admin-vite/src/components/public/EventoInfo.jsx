export default function EventoInfo({ evento }) {
  if (!evento) return null;

  const formatarDataHora = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl p-6 text-gray-800 shadow-lg mb-6 border border-gray-200">
      {/* Data */}
      <p className="text-lg font-bold mb-2">
        📅 {formatarDataHora(evento.data_inicio)}
      </p>

      {/* Título */}
      <h2 className="text-2xl font-extrabold text-cor-primaria mb-2">
        {evento.titulo}
      </h2>

      {/* Badge inscrição + valor */}
      {Number(evento.valor) > 0 && (
        <p className="text-base font-semibold text-yellow-600 mb-3">
          🔔 Evento com inscrição – R$ {parseFloat(evento.valor).toFixed(2)}
        </p>
      )}

      {/* Descrição */}
      {evento.descricao_completa && (
        <p className="text-sm leading-relaxed mb-4">
          {evento.descricao_completa}
        </p>
      )}

      {/* Local */}
      {evento.local && (
        <p className="text-base font-bold mb-1">📍 {evento.local}</p>
      )}

      {/* Endereço com link p/ Google Maps */}
      {evento.endereco && (
        <a
          href={`https://www.google.com/maps/search/?q=${encodeURIComponent(
            evento.endereco
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm mb-3 inline-block"
        >
          {evento.endereco}
        </a>
      )}

      {/* WhatsApp */}
      {evento.telefone_contato && (
        <div className="flex items-center gap-2 mt-2">
          <a
            href={`https://wa.me/55${evento.telefone_contato.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1"
            title="WhatsApp"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
              alt="WhatsApp"
              className="w-5 h-5"
            />
          </a>
          <span className="text-sm text-gray-700">{evento.telefone_contato}</span>
        </div>
      )}
    </div>
  );
}

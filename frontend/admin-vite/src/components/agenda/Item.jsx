import { useState, useRef, useEffect } from "react";
import AgendaDetalhe from "./Detalhe";
import ImageModal from "./ImageModal";
import { excluirEvento } from "../../services/agendaService";

function AgendaItem({ evento, onExcluir, onEditar, mostrarBotoes = true }) {
  const [expandido, setExpandido] = useState(false);
  const [mostrarImagem, setMostrarImagem] = useState(false);
  const cardRef = useRef(null);

  const {
    titulo,
    descricao_curta,
    data_inicio,
    data_fim,
    imagem_url,
    local,
    endereco,
    telefone_contato,
  } = evento;

  const formatarDataHora = (dataISO) => {
    if (!dataISO) return "";
    const data = new Date(dataISO);
    return data
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
      .toUpperCase();
  };

  const handleExcluir = async () => {
    const token = localStorage.getItem("token");
    if (confirm(`Deseja realmente excluir o evento "${titulo}"?`)) {
      try {
        await excluirEvento(evento.id, token);
        if (onExcluir) onExcluir();
      } catch (err) {
        console.error("Erro ao excluir evento:", err);
      }
    }
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickFora = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setExpandido(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => setExpandido((prev) => !prev)}
      className="bg-white text-black rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl w-full max-w-[350px] flex flex-col cursor-pointer"
    >
      {imagem_url && (
        <>
          <img
            src={imagem_url}
            alt={titulo}
            className="w-full h-[200px] object-contain bg-gray-100 cursor-zoom-in"
            onClick={(e) => {
              e.stopPropagation();
              setMostrarImagem(true);
            }}
          />

          {mostrarImagem && (
            <ImageModal
            imagemUrl={imagem_url}
            onClose={() => setMostrarImagem(false)}
            />
          )}
        </>
      )}

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-yellow-500 font-semibold text-sm mb-2">
          📅{" "}
          {data_fim
            ? `${formatarDataHora(data_inicio)} até ${formatarDataHora(
              data_fim
            )}`
            : formatarDataHora(data_inicio)}
        </span>

        <h3 className="text-lg font-bold mb-2">{titulo}</h3>
            {evento.com_inscricao ? (
              <span className="text-green-600 text-xs font-semibold mb-2">
                🔔 Evento com inscrição obrigatória
                {evento.valor > 0 &&
                  ` - R$ ${parseFloat(evento.valor).toFixed(2)}`}
              </span>
            ) : null}

        {descricao_curta && (
          <p className="text-sm text-gray-700 mb-3">{descricao_curta}</p>
        )}

        {local && <p className="text-sm text-gray-600">📍 {local}</p>}

        {endereco && (
          <a
            href={`https://www.google.com/maps/search/?q=${encodeURIComponent(
              endereco
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            {endereco}
          </a>
        )}

        {telefone_contato && (
          <div className="flex items-center gap-2 mt-1">
            <a
              href={`https://wa.me/55${telefone_contato.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
              title="WhatsApp"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
                alt="WhatsApp"
                className="w-5 h-5"
              />
            </a>
            <span className="text-sm text-gray-700">{telefone_contato}</span>
          </div>
        )}

        {mostrarBotoes && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandido(!expandido);
              }}
              className="text-blue-600 text-sm mt-3 underline self-start"
            >
              {expandido ? "Ocultar informações" : "Ver mais informações"}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleExcluir();
              }}
              className="mt-1 text-red-600 text-sm underline self-start"
            >
              Excluir
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditar && onEditar(evento);
              }}
              className="mt-1 text-blue-600 text-sm underline self-start"
            >
              ✏️ Editar
            </button>
          </>
        )}

        {expandido && <AgendaDetalhe evento={evento} />}
      </div>
    </div>
  );
}

export default AgendaItem;

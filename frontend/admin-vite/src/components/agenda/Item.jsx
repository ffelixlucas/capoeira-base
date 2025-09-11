import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AgendaDetalhe from "./Detalhe";
import ImageModal from "./ImageModal";
import { excluirEvento, arquivarEvento } from "../../services/agendaService";
import { toast } from "react-toastify";
import logger from "../../utils/logger";

function AgendaItem({ evento, onExcluir, onEditar, mostrarBotoes = true }) {
  if (!evento) return null;
  const navigate = useNavigate();

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
    com_inscricao,
    valor,
  } = evento;

  // Encerrado = agora > (data_fim || data_inicio)
  const encerrado = useMemo(() => {
    const fimOuInicio = data_fim || data_inicio;
    if (!fimOuInicio) return false;
    return Date.now() > new Date(fimOuInicio).getTime();
  }, [data_inicio, data_fim]);

  // Label do botão conforme existência de inscrição
  const labelAcao = com_inscricao == 1 ? "Arquivar" : "Excluir";

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

  const handleAcao = async () => {
    const token = localStorage.getItem("token");

    // Se tem inscrição → arquivar (status=concluido)
    if (com_inscricao == 1) {
      const ok = confirm(
        `Arquivar o evento "${titulo}"?\n\n` +
          "- O card sai da lista de próximos;\n" +
          "- As inscrições são mantidas em segurança;\n" +
          "- Você acessa em Encerrados."
      );
      if (!ok) return;

      try {
        await arquivarEvento(evento.id, token);
        toast.success("Evento arquivado. Inscrições mantidas com segurança.");
        onExcluir && onExcluir(); // recarrega lista no pai
      } catch (err) {
      logger.error("Erro ao arquivar evento:", err);
        toast.error("Não foi possível arquivar o evento.");
      }
      return;
    }

    // Sem inscrição → excluir de verdade
    const ok = confirm(`Deseja realmente excluir o evento "${titulo}"?`);
    if (!ok) return;

    try {
      await excluirEvento(evento.id, token);
      toast.success("Evento excluído com sucesso.");
      onExcluir && onExcluir();
    } catch (err) {
    logger.error("Erro ao excluir evento:", err);
      toast.error("Não foi possível excluir o evento.");
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

  // Clique no card:
  // - se tem inscrição → navega para /inscricoes/:id
  // - se não tem → alterna expandido (comportamento antigo)
  const handleClickCard = () => {
    if (com_inscricao == 1) {
      navigate(`/inscricoes/${evento.id}`);
    } else {
      setExpandido((prev) => !prev);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClickCard}
      className={`bg-white text-black rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl w-full max-w-[350px] flex flex-col ${
        com_inscricao == 1 ? "cursor-pointer" : "cursor-pointer"
      }`}
      title={
        com_inscricao == 1
          ? "Abrir gestão de inscritos"
          : "Ver mais informações"
      }
      aria-label={com_inscricao == 1 ? "Abrir gestão de inscritos" : "Evento"}
      role="group"
    >
      {/* Badges no topo */}
      <div className="flex justify-between items-center px-4 pt-3">
        {encerrado && (
          <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700">
            Encerrado
          </span>
        )}
        {com_inscricao == 1 && (
          <span className="inline-block text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700 ml-auto">
            Inscrição obrigatória
          </span>
        )}
      </div>

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

        {com_inscricao == 1 && (
          <span className="text-green-600 text-xs font-semibold mb-2">
            🔔 Evento com inscrição
            {Number(valor) > 0 ? ` - R$ ${parseFloat(valor).toFixed(2)}` : ""}
          </span>
        )}

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
                setExpandido((prev) => !prev);
              }}
              className="text-blue-600 text-sm mt-3 underline self-start"
            >
              {expandido ? "Ocultar informações" : "Ver mais informações"}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAcao();
              }}
              className="mt-1 text-red-600 text-sm underline self-start"
            >
              {labelAcao}
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

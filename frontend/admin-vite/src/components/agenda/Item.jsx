import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ImageModal from "./ImageModal";
import { arquivarEvento, excluirEvento } from "../../services/agendaService";
import logger from "../../utils/logger";

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function renderTextWithLinks(text) {
  if (!text) return null;
  const lines = String(text).split("\n");
  return lines.map((line, lineIndex) => {
    const parts = line.split(/(https?:\/\/[^\s]+)/g);
    return (
      <p key={`line-${lineIndex}`} className="mb-2">
        {parts.map((part, partIndex) => {
          if (/^https?:\/\/[^\s]+$/.test(part)) {
            return (
              <a
                key={`part-${lineIndex}-${partIndex}`}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-[#f4cf4e] hover:text-[#f7d96f] break-all"
              >
                {part}
              </a>
            );
          }
          return <span key={`part-${lineIndex}-${partIndex}`}>{part}</span>;
        })}
      </p>
    );
  });
}

function AgendaItem({ evento, onExcluir, onEditar, mostrarBotoes = true }) {
  if (!evento) return null;
  const navigate = useNavigate();
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [mostrarImagem, setMostrarImagem] = useState(false);

  const {
    id,
    titulo,
    descricao_curta,
    descricao_completa,
    data_inicio,
    data_fim,
    imagem_url,
    local,
    endereco,
    telefone_contato,
    whatsapp_url,
    com_inscricao,
    valor,
    configuracoes,
  } = evento;

  const imagemFocoX = Math.min(
    100,
    Math.max(0, Number(configuracoes?.imagem_foco_x ?? 50))
  );
  const imagemFocoY = Math.min(
    100,
    Math.max(0, Number(configuracoes?.imagem_foco_y ?? 50))
  );
  const objectPosition = `${imagemFocoX}% ${imagemFocoY}%`;

  const encerrado = useMemo(() => {
    const fimOuInicio = data_fim || data_inicio;
    if (!fimOuInicio) return false;
    return Date.now() > new Date(fimOuInicio).getTime();
  }, [data_inicio, data_fim]);

  const whatsappHref = whatsapp_url
    ? whatsapp_url
    : telefone_contato
    ? `https://wa.me/55${onlyDigits(telefone_contato)}`
    : null;

  const formatarDataSelo = (raw) => {
    if (!raw) return "Data a definir";
    const d = new Date(raw);
    const date = d
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return time === "00:00" ? date : `${date} • ${time}`;
  };

  const handleAcaoRemocao = async () => {
    const token = localStorage.getItem("token");
    const acao = Number(com_inscricao) === 1 ? "arquivar" : "excluir";
    const ok = confirm(
      acao === "arquivar"
        ? `Arquivar o evento "${titulo}"?`
        : `Excluir o evento "${titulo}"?`
    );
    if (!ok) return;

    try {
      if (acao === "arquivar") {
        await arquivarEvento(id, token);
        toast.success("Evento arquivado.");
      } else {
        await excluirEvento(id, token);
        toast.success("Evento excluído.");
      }
      onExcluir && onExcluir();
    } catch (error) {
      logger.error("Erro ao executar ação no evento", error);
      toast.error("Não foi possível concluir a ação.");
    }
  };

  const descricao = descricao_curta || local || "Detalhes do evento em breve.";

  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-emerald-200/20 bg-gradient-to-br from-[#153f31] to-[#1d4a39] text-[#f8f2dc] shadow-[0_20px_45px_rgba(2,26,19,0.35)] flex flex-col">
      <div className="relative h-44 md:h-52">
        {imagem_url ? (
          <img
            src={imagem_url}
            alt={titulo}
            className={`h-full w-full object-cover ${encerrado ? "grayscale" : ""}`}
            style={{ objectPosition }}
            onClick={() => setMostrarImagem(true)}
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#225843] to-[#17392d]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b241c]/95 via-[#0b241c]/35 to-transparent" />

        <span
          className={`absolute right-3 top-3 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.12em] font-extrabold ${
            encerrado
              ? "bg-[#e11d48] text-white shadow-[0_0_12px_rgba(225,29,72,0.65)]"
              : "bg-[#24f08f]/18 text-[#8fffc8] border border-[#31f39a]/55 shadow-[0_0_12px_rgba(36,240,143,0.45)]"
          }`}
        >
          {encerrado ? "Encerrado" : "Aberto"}
        </span>

        <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-[#0b241c]/85 border border-[#f4cf4e]/45 text-[#f4cf4e] text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1">
          {formatarDataSelo(data_fim || data_inicio)}
        </span>
      </div>

      <div className="p-5 md:p-6 flex flex-col flex-1">
        <h3 className="text-[#f8f2dc] text-lg md:text-xl font-bold leading-tight line-clamp-2 min-h-[3.5rem]">
          {titulo}
        </h3>
        <p className="mt-3 text-[#d6e4dc] text-sm md:text-base leading-relaxed line-clamp-3 min-h-[4.75rem]">
          {descricao}
        </p>

        <p className="mt-2 text-[#c4d8ce] text-sm md:text-base line-clamp-1 min-h-[1.5rem]">
          {local || "\u00A0"}
        </p>

        <div className="mt-auto pt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDetalhesAbertos(true)}
            className="inline-flex items-center gap-2 text-[#f4cf4e] font-semibold text-sm md:text-base hover:translate-x-1 transition-transform"
          >
            Ver detalhes <span>→</span>
          </button>

          {Number(com_inscricao) === 1 ? (
            <button
              type="button"
              onClick={() => navigate(`/inscricoes/${id}`)}
              className="ml-auto rounded-full bg-[#f4cf4e] px-4 py-2 text-xs md:text-sm font-bold text-[#101a15] hover:bg-[#f7d96f]"
            >
              Inscrever
            </button>
          ) : (
            <span className="ml-auto text-xs md:text-sm text-[#b7cdbf]">
              {encerrado ? "Evento finalizado" : "Sem inscrição"}
            </span>
          )}
        </div>

        {mostrarBotoes && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-emerald-100/15 pt-3">
            <button
              type="button"
              onClick={() => onEditar && onEditar(evento)}
              className="rounded-lg border border-sky-300/45 bg-sky-400/10 px-2.5 py-1 text-xs font-semibold text-sky-200 hover:bg-sky-400/20"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleAcaoRemocao}
              className="rounded-lg border border-rose-300/45 bg-rose-400/10 px-2.5 py-1 text-xs font-semibold text-rose-200 hover:bg-rose-400/20"
            >
              {Number(com_inscricao) === 1 ? "Arquivar" : "Excluir"}
            </button>
          </div>
        )}

      </div>

      {mostrarImagem && imagem_url && (
        <ImageModal imagemUrl={imagem_url} onClose={() => setMostrarImagem(false)} />
      )}

      {detalhesAbertos && (
        <div className="fixed inset-0 z-[120]">
          <div
            className="absolute inset-0 bg-[#04120e]/85 backdrop-blur-sm"
            onClick={() => setDetalhesAbertos(false)}
          />
          <div className="relative z-10 mx-auto mt-8 md:mt-12 w-[94%] max-w-3xl max-h-[86vh] overflow-y-auto rounded-3xl border border-emerald-200/20 bg-gradient-to-br from-[#153f31] to-[#1d4a39] p-4 md:p-6 text-[#f8f2dc] shadow-[0_20px_70px_rgba(2,26,19,0.5)]">
            <button
              type="button"
              onClick={() => setDetalhesAbertos(false)}
              className="absolute top-3 right-3 h-9 w-9 rounded-full border border-emerald-100/30 text-emerald-100 hover:bg-emerald-100/10"
            >
              ×
            </button>

            {imagem_url && (
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={imagem_url}
                  alt={titulo}
                  className="w-full max-h-[320px] object-cover cursor-zoom-in"
                  style={{ objectPosition }}
                  onClick={() => setMostrarImagem(true)}
                />
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-xl md:text-3xl font-black leading-tight">{titulo}</h3>
              <p className="mt-3 inline-flex items-center rounded-full border border-[#f4cf4e]/45 bg-[#0b241c]/85 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#f4cf4e]">
                {formatarDataSelo(data_fim || data_inicio)}
              </p>

              <div className="mt-4 text-sm md:text-base leading-relaxed text-[#d6e4dc]">
                {renderTextWithLinks(descricao_completa || descricao || endereco || "")}
              </div>

              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-lg border border-emerald-300/45 bg-emerald-400/10 px-3 py-1.5 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/20"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default AgendaItem;

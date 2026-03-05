import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listarEventos } from "../services/agendaService";
import { logger } from "../utils/logger";

function Inscricoes() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [situacao, setSituacao] = useState("ativos");

  useEffect(() => {
    carregarEventos();
  }, []);

  async function carregarEventos() {
    setCarregando(true);
    try {
      const dados = await listarEventos();
      setEventos((dados || []).filter((e) => Number(e.com_inscricao) === 1 || e.com_inscricao === true));
    } catch (err) {
      logger.error("Erro ao carregar eventos:", err);
    } finally {
      setCarregando(false);
    }
  }

  const parseDatetimeAsSaoPaulo = (value) => {
    if (!value) return Number.NaN;
    const raw = String(value).trim();
    if (!raw) return Number.NaN;
    if (raw.includes("T") || /[zZ]|[+\-]\d{2}:\d{2}$/.test(raw)) {
      const parsed = new Date(raw).getTime();
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    }
    const normalized = raw.replace(" ", "T");
    const parsed = new Date(`${normalized}-03:00`).getTime();
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const getEventoReferenciaTs = (evento) => {
    const prioridade = [evento.inscricoes_ate, evento.data_fim, evento.data_inicio];
    for (const candidate of prioridade) {
      const ts = parseDatetimeAsSaoPaulo(candidate);
      if (Number.isFinite(ts)) return ts;
    }
    return Number.NaN;
  };

  const eventosProcessados = useMemo(() => {
    const agora = Date.now();
    return eventos.map((evento) => {
      const referenciaTs = getEventoReferenciaTs(evento);
      return {
        ...evento,
        referenciaTs,
        encerrado: Number.isFinite(referenciaTs) ? agora > referenciaTs : false,
      };
    });
  }, [eventos]);

  const eventosFiltrados = useMemo(() => {
    const list = eventosProcessados.filter((evento) =>
      situacao === "encerrados" ? evento.encerrado : !evento.encerrado
    );

    return list.sort((a, b) => {
      const aTs = Number.isFinite(a.referenciaTs) ? a.referenciaTs : 0;
      const bTs = Number.isFinite(b.referenciaTs) ? b.referenciaTs : 0;
      if (situacao === "encerrados") return bTs - aTs;
      return aTs - bTs;
    });
  }, [eventosProcessados, situacao]);

  const formatarDataHora = (evento) => {
    const ts = getEventoReferenciaTs(evento);
    if (!Number.isFinite(ts)) return "Data a definir";
    const d = new Date(ts);
    const data = d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return hora === "00:00" ? data : `${data} • ${hora}`;
  };

  const formatarMoeda = (valor) => {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "R$ 0,00";
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <div className="h-1.5 w-20 rounded-full bg-[#f4cf4e] mb-3" />
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#f4cf4e] mb-1">
          Gestão de inscrições
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#f8f2dc]">
          EVENTOS COM INSCRIÇÃO
        </h1>
        <p className="mt-2 text-[#d6e4dc] text-sm sm:text-base">
          Acompanhe eventos abertos e encerrados, com acesso rápido aos inscritos.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <button
          type="button"
          onClick={() => navigate("/agenda")}
          className="inline-flex items-center justify-center rounded-full border border-[#f4cf4e]/45 bg-[#f4cf4e]/10 px-5 py-2.5 text-[#f4cf4e] text-sm font-bold hover:bg-[#f4cf4e]/20 transition-colors"
        >
          Voltar para Eventos
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setSituacao("ativos")}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
            situacao === "ativos"
              ? "bg-[#f4cf4e] text-[#142018] border-[#f4cf4e]"
              : "bg-transparent text-[#d6e4dc] border-[#d6e4dc]/30 hover:border-[#f4cf4e]/50"
          }`}
        >
          Próximos
        </button>
        <button
          type="button"
          onClick={() => setSituacao("encerrados")}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
            situacao === "encerrados"
              ? "bg-[#f4cf4e] text-[#142018] border-[#f4cf4e]"
              : "bg-transparent text-[#d6e4dc] border-[#d6e4dc]/30 hover:border-[#f4cf4e]/50"
          }`}
        >
          Encerrados
        </button>
      </div>

      {carregando && <p className="text-[#d6e4dc]/70 py-6">Carregando eventos...</p>}

      {!carregando && eventosFiltrados.length === 0 && (
        <p className="text-[#d6e4dc]/70 py-6">
          Nenhum evento {situacao === "ativos" ? "próximo" : "encerrado"} com inscrição obrigatória.
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {eventosFiltrados.map((evento) => (
          <article
            key={evento.id}
            className={`w-full overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-[0_18px_35px_rgba(2,26,19,0.28)] ${
              evento.encerrado
                ? "border-[#d6e4dc]/15 bg-gradient-to-br from-[#1f3a31] to-[#2a473c] opacity-95"
                : "border-emerald-200/20 bg-gradient-to-br from-[#153f31] to-[#1d4a39]"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[#f8f2dc] text-lg font-bold leading-tight break-words">
                  {evento.titulo}
                </h2>
                <p className="mt-1 text-[#d6e4dc]/80 text-sm break-words">
                  {evento.local || "Local a definir"}
                </p>
              </div>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] uppercase tracking-[0.1em] font-extrabold ${
                  evento.encerrado
                    ? "bg-[#e11d48] text-white shadow-[0_0_12px_rgba(225,29,72,0.55)]"
                    : "bg-[#24f08f]/18 text-[#8fffc8] border border-[#31f39a]/55"
                }`}
              >
                {evento.encerrado ? "Encerrado" : "Aberto"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center rounded-full border border-[#f4cf4e]/35 bg-[#0b241c]/65 px-2.5 py-1 text-[#f4cf4e] font-bold uppercase tracking-[0.08em]">
                {formatarDataHora(evento)}
              </span>
              {Number(evento.valor) > 0 && (
                <span className="inline-flex items-center rounded-full border border-[#f4cf4e]/30 bg-[#f4cf4e]/10 px-2.5 py-1 text-[#f4cf4e] font-semibold">
                  R$ {Number(evento.valor).toFixed(2)}
                </span>
              )}
              {evento.total_inscritos !== undefined && (
                <span className="inline-flex items-center rounded-full border border-[#d6e4dc]/25 bg-[#d6e4dc]/10 px-2.5 py-1 text-[#d6e4dc] font-semibold">
                  {evento.total_inscritos} inscritos
                </span>
              )}
            </div>

            <div className="mt-3 rounded-xl border border-[#d6e4dc]/15 bg-[#0f2f24]/45 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#d6e4dc]/70 font-semibold">
                Prévia da gestão
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="rounded-lg border border-[#d6e4dc]/15 bg-[#d6e4dc]/5 px-2.5 py-2">
                  <p className="text-[#d6e4dc]/70 text-[11px]">Inscritos pagos</p>
                  <p className="text-[#f8f2dc] font-bold">{Number(evento.total_inscritos ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-[#d6e4dc]/15 bg-[#d6e4dc]/5 px-2.5 py-2">
                  <p className="text-[#d6e4dc]/70 text-[11px]">Pendentes</p>
                  <p className="text-[#f8f2dc] font-bold">{Number(evento.total_pendentes ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-[#d6e4dc]/15 bg-[#d6e4dc]/5 px-2.5 py-2">
                  <p className="text-[#d6e4dc]/70 text-[11px]">Total líquido</p>
                  <p className="text-[#f8f2dc] font-bold">{formatarMoeda(evento.valor_liquido_total ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-[#d6e4dc]/15 bg-[#d6e4dc]/5 px-2.5 py-2">
                  <p className="text-[#d6e4dc]/70 text-[11px]">Valor da inscrição</p>
                  <p className="text-[#f8f2dc] font-bold">{formatarMoeda(evento.valor ?? 0)}</p>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[#d6e4dc] text-sm line-clamp-2 break-words">
              {evento.descricao_curta || "Sem descrição disponível."}
            </p>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate(`/inscricoes/${evento.id}`)}
                className="inline-flex items-center justify-center rounded-full bg-[#f4cf4e] px-4 py-2 text-[#142018] text-sm font-bold hover:bg-[#f7d96f] transition-colors"
              >
                Gerenciar inscritos
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Inscricoes;

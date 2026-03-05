import { useEffect, useMemo, useRef, useState } from "react";
import AgendaItem from "./Item";

function CarrosselEventos({ eventos, onEditar, onExcluir }) {
  const trackRef = useRef(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  const parseEventoDate = (value) => {
    if (!value) return Number.NaN;
    const raw = String(value).trim();
    if (!raw) return Number.NaN;

    // aceita formatos ISO e também MySQL ("YYYY-MM-DD HH:MM:SS")
    const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
    const withTz = /[zZ]|[+\-]\d{2}:\d{2}$/.test(normalized)
      ? normalized
      : `${normalized}-03:00`;

    const parsed = new Date(withTz).getTime();
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const eventosOrdenados = useMemo(() => {
    if (!Array.isArray(eventos)) return [];
    const agora = Date.now();
    return [...eventos].sort((a, b) => {
      const aTime = parseEventoDate(a.data_inicio || a.data_fim);
      const bTime = parseEventoDate(b.data_inicio || b.data_fim);
      const aPassou = Number.isFinite(aTime) ? aTime < agora : false;
      const bPassou = Number.isFinite(bTime) ? bTime < agora : false;
      if (aPassou !== bPassou) return aPassou ? 1 : -1;
      if (!Number.isFinite(aTime) && !Number.isFinite(bTime)) return 0;
      if (!Number.isFinite(aTime)) return 1;
      if (!Number.isFinite(bTime)) return -1;
      return aTime - bTime;
    });
  }, [eventos]);

  if (eventosOrdenados.length === 0) {
    return <p className="text-sm text-cor-texto/70">Nenhum evento cadastrado.</p>;
  }

  const nextIndex = eventosOrdenados.findIndex((evento) => {
    const ts = parseEventoDate(evento.data_fim || evento.data_inicio);
    return Number.isFinite(ts) ? ts >= Date.now() : false;
  });

  const atualizarControles = () => {
    const track = trackRef.current;
    if (!track) return;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const left = Math.max(0, track.scrollLeft);
    setCanGoPrev(left > 4);
    setCanGoNext(left < maxScrollLeft - 4);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    atualizarControles();
    track.addEventListener("scroll", atualizarControles, { passive: true });
    window.addEventListener("resize", atualizarControles);

    return () => {
      track.removeEventListener("scroll", atualizarControles);
      window.removeEventListener("resize", atualizarControles);
    };
  }, [eventosOrdenados.length]);

  const scrollByStep = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector("[data-agenda-card]");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || "0");
    const viewport = track.clientWidth;
    const step = firstCard
      ? Math.max(220, Math.floor(firstCard.getBoundingClientRect().width + gap))
      : window.innerWidth >= 1024
      ? Math.floor(viewport * 0.6)
      : Math.floor(viewport * 0.9);
    track.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  };

  return (
    <div className="mt-4">

      <div
        ref={trackRef}
        className="w-full min-w-0 flex items-stretch gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {eventosOrdenados.map((evento, index) => (
          <div
            key={evento.id}
            data-agenda-card
            className="snap-start shrink-0 basis-full sm:basis-[72%] lg:basis-[48%] 2xl:basis-[32%] h-full"
          >
            <AgendaItem
              evento={evento}
              isNextEvent={nextIndex !== -1 && index === nextIndex}
              onEditar={() => onEditar(evento)}
              onExcluir={onExcluir}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center md:justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByStep("prev")}
          className="h-11 w-11 rounded-full border border-emerald-100/35 bg-emerald-950/40 text-amber-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-950/70 transition-colors shadow-[0_0_18px_rgba(8,38,30,0.45)]"
          aria-label="Anterior"
          disabled={!canGoPrev}
        >
          ❮
        </button>
        <button
          type="button"
          onClick={() => scrollByStep("next")}
          className="h-11 w-11 rounded-full border border-emerald-100/35 bg-emerald-950/40 text-amber-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-950/70 transition-colors shadow-[0_0_18px_rgba(8,38,30,0.45)]"
          aria-label="Próximo"
          disabled={!canGoNext}
        >
          ❯
        </button>
      </div>
    </div>
  );
}

export default CarrosselEventos;

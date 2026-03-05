import { useEffect, useMemo, useRef, useState } from "react";
import AgendaItem from "./Item";

function CarrosselEventos({ eventos, onEditar, onExcluir }) {
  const trackRef = useRef(null);
  const [canGoPrev, setCanGoPrev] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);

  const eventosOrdenados = useMemo(() => {
    if (!Array.isArray(eventos)) return [];
    const agora = Date.now();
    return [...eventos].sort((a, b) => {
      const aTime = new Date(a.data_fim || a.data_inicio || 0).getTime();
      const bTime = new Date(b.data_fim || b.data_inicio || 0).getTime();
      const aPassou = Number.isFinite(aTime) ? aTime < agora : true;
      const bPassou = Number.isFinite(bTime) ? bTime < agora : true;
      if (aPassou !== bPassou) return aPassou ? 1 : -1;
      return aTime - bTime;
    });
  }, [eventos]);

  if (eventosOrdenados.length === 0) return null;

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
        {eventosOrdenados.map((evento) => (
          <div
            key={evento.id}
            data-agenda-card
            className="snap-start shrink-0 basis-full sm:basis-[72%] lg:basis-[48%] 2xl:basis-[32%] h-full"
          >
            <AgendaItem
              evento={evento}
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

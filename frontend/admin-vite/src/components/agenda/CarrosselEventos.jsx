import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";
import AgendaItem from "./AgendaItem";

function CarrosselEventos({ eventos, onEditar, onExcluir }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [indiceAtual, setIndiceAtual] = useState(1);

  useEffect(() => {
    if (!emblaApi) return;

    const updateIndex = () =>
      setIndiceAtual(emblaApi.selectedScrollSnap() + 1);

    emblaApi.on("select", updateIndex);
    updateIndex(); // Inicializa no load
  }, [emblaApi]);

  if (eventos.length === 0) return null;

  return (
    <div className="relative mt-4">
      {/* Contador */}
      <div className="text-center text-sm text-gray-500 mb-2">
        Evento {indiceAtual} / {eventos.length}
      </div>

      {/* Botão esquerda */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center"
        aria-label="Voltar"
      >
        ←
      </button>

      {/* Botão direita */}
      <button
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center"
        aria-label="Avançar"
      >
        →
      </button>

      {/* Carrossel Embla */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {eventos.map((evento) => (
            <div
              key={evento.id}
              className="flex-shrink-0 w-[85vw] max-w-sm px-2"
            >
              <AgendaItem
                evento={evento}
                onEditar={() => onEditar(evento)}
                onExcluir={onExcluir}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CarrosselEventos;

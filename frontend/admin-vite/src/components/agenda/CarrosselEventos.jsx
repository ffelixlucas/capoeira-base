import { useState } from "react";
import AgendaItem from "./AgendaItem";

function CarrosselEventos({ eventos, onEditar, onExcluir }) {
  const [index, setIndex] = useState(0);

  if (!eventos || eventos.length === 0) return null;

  const eventoAtual = eventos[index];

  const irParaAnterior = () => {
    if (index > 0) setIndex(index - 1);
  };

  const irParaProximo = () => {
    if (index < eventos.length - 1) setIndex(index + 1);
  };

  return (
    <div className="relative mt-4">
      {/* Contador */}
      <div className="text-center text-sm text-gray-500 mb-2">
        Evento {index + 1} / {eventos.length}
      </div>

      {/* Card atual */}
      <div className="flex justify-center">
        <AgendaItem
          evento={eventoAtual}
          onEditar={() => onEditar(eventoAtual)}
          onExcluir={onExcluir}
        />
      </div>

      {/* Botões navegação */}
      {eventos.length > 1 && (
        <>
          <button
            onClick={irParaAnterior}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center"
            aria-label="Anterior"
            disabled={index === 0}
          >
            ←
          </button>
          <button
            onClick={irParaProximo}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white w-9 h-9 rounded-full flex items-center justify-center"
            aria-label="Próximo"
            disabled={index === eventos.length - 1}
          >
            →
          </button>
        </>
      )}
    </div>
  );
}

export default CarrosselEventos;

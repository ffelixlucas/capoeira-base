import { useEffect } from "react";
import AgendaForm from "./Form";

function ModalEvento({ eventoEditando, onFechar, onCriado }) {
  useEffect(() => {
    const fecharComEsc = (e) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", fecharComEsc);
    return () => document.removeEventListener("keydown", fecharComEsc);
  }, [onFechar]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
<div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto px-0 py-4">
{/* Botão fechar */}
        <button
          onClick={onFechar}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-600 bg-white hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center shadow"
          aria-label="Fechar"
          title="Fechar"
        >
          ✕
        </button>

        <AgendaForm
          eventoEditando={eventoEditando}
          onCriado={onCriado}
          onLimparEdicao={onFechar}
        />
      </div>
    </div>
  );
}

export default ModalEvento;

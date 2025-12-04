// src/components/alunos/FotoAlunoThumb.jsx
import { Camera } from "lucide-react";

export default function FotoAlunoThumb({ foto, nome, onClick }) {
  const inicial = nome ? nome.charAt(0).toUpperCase() : "?";

  return (
    <div className="relative mx-auto mb-4 w-fit">
      {foto ? (
        <img
          src={foto}
          className="h-24 w-24 rounded-full object-cover border shadow cursor-pointer"
          onClick={onClick}
        />
      ) : (
        <div
          onClick={onClick}
          className="h-24 w-24 rounded-full flex items-center justify-center bg-gray-200 text-3xl font-semibold text-gray-600 border shadow cursor-pointer"
        >
          {inicial}
        </div>
      )}

      {/* Ícone da câmera */}
      <button
        onClick={onClick}
        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 active:scale-95 transition-all"
      >
        <Camera size={16} />
      </button>
    </div>
  );
}

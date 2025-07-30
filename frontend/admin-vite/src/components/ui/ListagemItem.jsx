// src/components/listagem/ListagemItem.jsx
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function ListagemItem({ titulo, subtitulo, onVerMais }) {
  return (
    <div
      className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
      onClick={onVerMais}
    >
      <div className="flex flex-col text-left w-full overflow-hidden">
        <div className="flex items-center gap-2">{titulo}</div>
        {subtitulo && (
          <span className="text-sm text-gray-500 truncate">{subtitulo}</span>
        )}
      </div>
      <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-2 shrink-0" />
    </div>
  );
}

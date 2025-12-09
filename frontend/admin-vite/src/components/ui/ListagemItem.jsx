import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function ListagemItem({ titulo, subtitulo, onVerMais }) {
  return (
    <div
className="flex items-start gap-1.5 p-2 hover:bg-gray-50 cursor-pointer"

      onClick={onVerMais}
    >
      <div className="flex flex-col text-left w-full overflow-hidden">
        <div className="flex items-start gap-2 w-full">
          {titulo}
        </div>

        {subtitulo && (
          <span className="mt-1 text-sm text-gray-500 block w-full">
            {subtitulo}
          </span>
        )}
      </div>

      <ChevronRightIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
    </div>
  );
}

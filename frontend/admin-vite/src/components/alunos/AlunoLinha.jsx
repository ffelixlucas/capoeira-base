// src/components/alunos/AlunoLinha.jsx
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function AlunoLinha({ aluno, onVerMais }) {
  return (
    <div
      className="flex items-center justify-between p-4 border-b hover:bg-gray-50 cursor-pointer min-h-[72px]"
      onClick={() => onVerMais(aluno)}
    >
      <div className="flex flex-col text-left w-full overflow-hidden">
        <span className="font-bold text-base text-gray-800 truncate">
          {aluno.apelido || "Sem apelido"}
        </span>
        <span className="text-sm text-gray-500 truncate">
          {aluno.nome}
        </span>
      </div>

      <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-2 shrink-0" />
    </div>
  );
}

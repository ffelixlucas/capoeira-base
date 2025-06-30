// src/components/horarios/HorarioList.jsx

import React from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

function HorarioList({
  horarios,
  onEditar,
  onExcluir,
  carregando,
  onMoverCima,
  onMoverBaixo,
}) {
  if (carregando) {
    return <p className="text-center">🔄 Carregando horários...</p>;
  }

  if (horarios.length === 0) {
    return <p className="text-center">⚠️ Nenhum horário cadastrado.</p>;
  }

  return (
    <div className="space-y-4">
      {horarios.map((item, index) => (
        <div
          key={item.id}
          className="flex flex-col md:flex-row justify-between items-start md:items-center border border-cor-primaria rounded-lg p-4 shadow-sm bg-cor-secundaria text-cor-texto"
        >
          <div className="flex-1">
            <h2 className="text-lg font-bold">{item.turma}</h2>
            <p className="text-sm">
              {item.dias} • {item.horario}
            </p>
            <p className="text-sm">Faixa etária: {item.faixa_etaria}</p>
            {item.instrutor && (
              <p className="text-sm">Instrutor(a): {item.instrutor}</p>
            )}
            {item.whatsapp_instrutor && (
              <p className="text-sm">WhatsApp: {item.whatsapp_instrutor}</p>
            )}
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            {/* Botão subir */}
            <button
              onClick={() => onMoverCima(index)}
              disabled={index === 0}
              className={`p-2 rounded ${
                index === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-cor-primaria hover:bg-cor-destaque"
              }`}
              title="Mover para cima"
            >
              <ArrowUpIcon className="h-5 w-5 text-cor-escura" />
            </button>

            {/* Botão descer */}
            <button
              onClick={() => onMoverBaixo(index)}
              disabled={index === horarios.length - 1}
              className={`p-2 rounded ${
                index === horarios.length - 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-cor-primaria hover:bg-cor-destaque"
              }`}
              title="Mover para baixo"
            >
              <ArrowDownIcon className="h-5 w-5 text-cor-escura" />
            </button>

            {/* Botão editar */}
            <button
              onClick={() => onEditar(item)}
              className="p-2 rounded bg-blue-500 hover:bg-blue-600"
              title="Editar"
            >
              <PencilIcon className="h-5 w-5 text-white" />
            </button>

            {/* Botão excluir */}
            <button
              onClick={() => onExcluir(item.id)}
              className="p-2 rounded bg-red-500 hover:bg-red-600"
              title="Excluir"
            >
              <TrashIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HorarioList;

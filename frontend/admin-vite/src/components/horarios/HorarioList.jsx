// src/components/horarios/HorarioList.jsx

import React from 'react';

function HorarioList({ horarios, onEditar, onExcluir, carregando }) {
  if (carregando) {
    return <p className="text-center">🔄 Carregando horários...</p>;
  }

  if (horarios.length === 0) {
    return <p className="text-center">⚠️ Nenhum horário cadastrado.</p>;
  }

  return (
    <div className="space-y-4">
      {horarios.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center border rounded-lg p-4 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-bold">{item.turma}</h2>
            <p className="text-sm">{item.dias} • {item.horario}</p>
            <p className="text-sm">Faixa etária: {item.faixa_etaria}</p>
            {item.instrutor && (
              <p className="text-sm">Instrutor: {item.instrutor}</p>
            )}
            {item.whatsapp_instrutor && (
              <p className="text-sm">
                WhatsApp: {item.whatsapp_instrutor}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEditar(item)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Editar
            </button>
            <button
              onClick={() => onExcluir(item.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HorarioList;

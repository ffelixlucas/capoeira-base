import { useState } from "react";

export default function ResumoCamisetas({ resumo = [] }) {
  const [expandido, setExpandido] = useState(false);

  // Total geral
  const total = resumo.reduce((acc, item) => acc + (item.total || 0), 0);

  // Copiar texto pronto
  function copiarResumo() {
    const texto = resumo
      .map((item) => `${item.tamanho || "Não informado"}: ${item.total}`)
      .join("\n");
    const final = `👕 Camisetas (${total} no total)\n${texto}`;
    navigator.clipboard.writeText(final);
    alert("✅ Resumo copiado para área de transferência!");
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      {/* Cabeçalho */}
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpandido(!expandido)}
      >
        <h3 className="text-sm font-semibold text-gray-700">
          👕 Camisetas: {total}
        </h3>
        <span className="text-xs text-blue-600">
          {expandido ? "Fechar ▲" : "Ver detalhes ▼"}
        </span>
      </div>

      {/* Lista expandida */}
      {expandido && (
        <div className="mt-3 space-y-1">
          <ul className="text-sm text-gray-600">
            {resumo.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{item.tamanho || "Não informado"}</span>
                <span className="font-bold">{item.total}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={copiarResumo}
            className="mt-3 w-full bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700"
          >
            📋 Copiar resumo
          </button>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

export default function ResumoCamisetas({ resumo = [] }) {
  const [expandido, setExpandido] = useState(false);

  // Filtra apenas tamanhos válidos (ignora null, "-", vazio)
  const validos = resumo.filter(
    (item) => item.tamanho && item.tamanho !== "-" && item.tamanho.trim() !== ""
  );

  // Total geral (somente válidos)
  const total = validos.reduce((acc, item) => acc + (item.total || 0), 0);

  // Copiar texto pronto
  function copiarResumo() {
    const texto = validos
      .map((item) => `${item.tamanho}: ${item.total}`)
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
            {validos.map((item, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{item.tamanho}</span>
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

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProdutoCard({ produto, onSelecionar }) {
  return (
    <button
      onClick={() => onSelecionar(produto)}
      className="text-left block w-full border rounded-lg shadow-sm hover:shadow-md transition bg-white"
    >
      {/* Imagem Placeholder */}
      <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-t-lg">
        <span className="text-gray-400 text-sm">
          Imagem em breve
        </span>
      </div>

      <div className="p-3 space-y-2">
        <h2 className="text-sm font-medium text-gray-800 line-clamp-2">
          {produto.nome}
        </h2>

        {produto.categoria && (
          <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {produto.categoria}
          </span>
        )}

        <p className="text-lg font-bold text-black">
          {formatarPreco(produto.preco_minimo)}
        </p>

        <p className="text-xs text-gray-500">
          Ver opções
        </p>
      </div>
    </button>
  );
}

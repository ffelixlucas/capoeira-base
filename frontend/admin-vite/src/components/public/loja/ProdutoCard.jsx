import { Link } from "react-router-dom";

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProdutoCard({ sku, slug }) {
  return (
    <Link
      to={`/loja/${slug}/produto/${sku.id}`}
      className="block border rounded-lg shadow-sm hover:shadow-md transition bg-white"
    >
      {/* Imagem Placeholder */}
      <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-t-lg">
        <span className="text-gray-400 text-sm">
          Imagem em breve
        </span>
      </div>

      <div className="p-3 space-y-1">
        {/* Nome */}
        <h2 className="text-sm font-medium text-gray-800 line-clamp-2">
          {sku.produto_nome}
        </h2>

        {/* Badge */}
        {sku.pronta_entrega === 1 && (
          <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            Pronta entrega
          </span>
        )}

        {/* Preço */}
        <p className="text-lg font-bold text-black">
          {formatarPreco(sku.preco)}
        </p>

        {/* SKU código */}
        <p className="text-xs text-gray-500">
          {sku.sku_codigo}
        </p>
      </div>
    </Link>
  );
}

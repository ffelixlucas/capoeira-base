import { useParams } from "react-router-dom";
import { useProdutoPublic } from "../../hooks/public/useProdutoPublic";

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProdutoPublic() {
  const { slug, id } = useParams();
  const { produto, carregando, erro } = useProdutoPublic(slug, id);

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando produto...</p>
      </div>
    );
  }

  if (erro || !produto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          Produto não encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cor-fundo py-8">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow p-6 grid md:grid-cols-2 gap-8">

          {/* Imagem */}
          <div className="w-full h-80 bg-gray-100 flex items-center justify-center rounded-lg">
            <span className="text-gray-400">
              Imagem em breve
            </span>
          </div>

          {/* Informações */}
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {produto.produto_nome}
            </h1>

            <p className="text-gray-600 mb-4">
              {produto.produto_descricao}
            </p>

            <p className="text-3xl font-bold mb-4">
              {formatarPreco(produto.preco)}
            </p>

            {produto.pronta_entrega === 1 && (
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded text-sm mb-4">
                Pronta entrega
              </span>
            )}

            <button className="btn-primary w-full mt-4">
              Comprar agora
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

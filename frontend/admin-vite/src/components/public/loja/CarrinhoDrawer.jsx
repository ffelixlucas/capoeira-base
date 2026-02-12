import { useCarrinho } from "../../../contexts/public/loja/CarrinhoContext";
import { useNavigate, useParams } from "react-router-dom";  

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CarrinhoDrawer({ aberto, fechar }) {
  const { itens, removerItem } = useCarrinho();
  const navigate = useNavigate();
  const { slug } = useParams();

  const subtotal = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  return (
    <>
      {aberto && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={fechar}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-cor-secundaria text-cor-texto shadow-lg z-50 transform transition-transform duration-300 ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">Seu Carrinho</h2>
          <button onClick={fechar}>✕</button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
          {itens.length === 0 && (
            <p className="text-gray-500">Carrinho vazio.</p>
          )}

          {itens.map((item) => (
            <div
              key={item.skuId}
              className="flex justify-between items-start border-b pb-3"
            >
              <div>
                <p className="font-medium">{item.nome}</p>

                {item.tamanho && (
                  <p className="text-xs text-gray-300">
                    Tamanho: {item.tamanho}
                  </p>
                )}

                <p className="text-sm text-gray-300 mt-1">
                  {item.quantidade} x {formatarPreco(item.preco)}
                </p>
              </div>

              <button
                onClick={() => removerItem(item.skuId)}
                className="text-red-500 text-sm"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <p className="font-bold mb-4">
            Subtotal: {formatarPreco(subtotal)}
          </p>

          <button
            onClick={() => navigate(`/loja/${slug}/checkout`)}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
            disabled={itens.length === 0}
          >
            Finalizar Pedido
          </button>

        </div>
      </div>
    </>
  );
}

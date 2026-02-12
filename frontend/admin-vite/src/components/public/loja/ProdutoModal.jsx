import { useEffect, useState } from "react";
import { useCarrinho } from "../../../contexts/public/loja/CarrinhoContext";
import { useParams } from "react-router-dom";
import { buscarProdutoPorId } from "../../../services/public/loja/lojaPublicService";

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProdutoModal({ produto, fechar }) {
  const { slug } = useParams();
  const { adicionarItem } = useCarrinho();

  const [dadosProduto, setDadosProduto] = useState(null);
  const [skuSelecionado, setSkuSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!produto) return;

    async function carregarProduto() {
      try {
        setCarregando(true);
        const response = await buscarProdutoPorId(slug, produto.id);

        if (response?.success) {
          setDadosProduto(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarProduto();
  }, [produto, slug]);

  if (!produto) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={fechar}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white text-black w-full max-w-md rounded-xl shadow-lg p-6 relative">

          <button
            onClick={fechar}
            className="absolute top-3 right-3 text-gray-500"
          >
            ✕
          </button>

          <div className="h-48 bg-gray-100 flex items-center justify-center rounded mb-4">
            <span className="text-gray-400">Imagem em breve</span>
          </div>

          <h2 className="text-lg font-bold mb-2">
            {produto.nome}
          </h2>

          <p className="text-gray-600 mb-4">
            {produto.descricao}
          </p>

          {carregando && (
            <p className="text-gray-500 text-sm">Carregando opções...</p>
          )}

          {dadosProduto?.skus?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Escolha o tamanho:</p>

              <div className="flex flex-wrap gap-2">
                {dadosProduto.skus.map((sku) => (
                  <button
                    key={sku.id}
                    onClick={() => setSkuSelecionado(sku)}
                    className={`px-3 py-1 border rounded text-sm ${
                      skuSelecionado?.id === sku.id
                        ? "bg-black text-white"
                        : "bg-white"
                    }`}
                  >
                    {sku.atributos?.tamanho || sku.sku_codigo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {skuSelecionado && (
            <p className="text-xl font-bold mb-4">
              {formatarPreco(skuSelecionado.preco)}
            </p>
          )}

          <button
            disabled={!skuSelecionado}
            onClick={() => {
              adicionarItem({
                skuId: skuSelecionado.id,
                nome: produto.nome,
                preco: skuSelecionado.preco,
                tamanho: skuSelecionado.atributos?.tamanho,
              });
              fechar();
            }}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
          >
            Adicionar ao carrinho
          </button>

        </div>
      </div>
    </>
  );
}

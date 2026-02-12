import { useParams } from "react-router-dom";
import { useProdutosPublic } from "../../../hooks/public/loja/useProdutosPublic";
import ProdutoCard from "../../../components/public/loja/ProdutoCard";
import { useState } from "react";
import { useCarrinho } from "../../../contexts/public/loja/CarrinhoContext";
import CarrinhoDrawer from "../../../components/public/loja/CarrinhoDrawer";
import ProdutoModal from "../../../components/public/loja/ProdutoModal";

export default function LojaPublic() {
  const { slug } = useParams();
  const { produtos, carregando, erro } = useProdutosPublic(slug);

  const { itens } = useCarrinho();
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const quantidadeTotal = itens.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  return (
    <div className="min-h-screen bg-cor-fundo py-8">
      <div className="w-full max-w-7xl mx-auto px-4">

        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Loja Online
        </h1>

        {carregando && (
          <p className="text-center text-gray-600">
            Carregando produtos...
          </p>
        )}

        {erro && (
          <p className="text-center text-red-500">
            {erro}
          </p>
        )}

        {!carregando && !erro && produtos.length === 0 && (
          <p className="text-center text-gray-600">
            Nenhum produto disponível.
          </p>
        )}

        {!carregando && produtos.length > 0 && (
          <div
            className="
              grid 
              grid-cols-2 
              sm:grid-cols-3 
              md:grid-cols-4 
              lg:grid-cols-5 
              gap-4
            "
          >
            {produtos.map((produto) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                onSelecionar={() => setProdutoSelecionado(produto)}
              />
            ))}
          </div>
        )}
      </div>

      {quantidadeTotal > 0 && (
        <button
          onClick={() => setDrawerAberto(true)}
          className="fixed bottom-6 right-6 bg-black text-white px-4 py-3 rounded-full shadow-lg z-50"
        >
          🛒 {quantidadeTotal}
        </button>
      )}

      <CarrinhoDrawer
        aberto={drawerAberto}
        fechar={() => setDrawerAberto(false)}
      />

      <ProdutoModal
        produto={produtoSelecionado}
        fechar={() => setProdutoSelecionado(null)}
      />
    </div>
  );
}

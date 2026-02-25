// LojaPublic.jsx - Versão com as cores do projeto
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
    <div className="min-h-screen bg-cor-fundo">
      
      {/* Header com as cores do projeto */}
      <header className="bg-cor-secundaria border-b border-cor-primaria/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-cor-titulo">
              Loja
            </h1>          
        
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Título da página */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-cor-titulo">
            Produtos disponíveis
          </h2>
        </div>

        {/* Estados de carregamento/erro */}
        {carregando && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-cor-primaria border-t-transparent rounded-full animate-spin"></div>
            <p className="text-cor-texto/60 mt-4">Carregando produtos...</p>
          </div>
        )}

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-500 font-medium">😕 {erro}</p>
            <button className="mt-3 text-sm text-cor-primaria hover:text-cor-destaque transition">
              Tentar novamente
            </button>
          </div>
        )}

        {!carregando && !erro && produtos.length === 0 && (
          <div className="bg-cor-secundaria/20 border border-cor-secundaria/30 rounded-lg p-12 text-center">
            <span className="text-5xl mb-3 block text-cor-texto/30">🏪</span>
            <p className="text-cor-texto font-medium">
              Nenhum produto disponível no momento
            </p>
            <p className="text-sm text-cor-texto/50 mt-1">
              Volte mais tarde ou explore outras categorias
            </p>
          </div>
        )}

        {/* Grid de produtos */}
        {!carregando && produtos.length > 0 && (
          <>
            <div className="mb-4 text-sm text-cor-texto/50">
              {produtos.length} {produtos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {produtos.map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  onSelecionar={() => setProdutoSelecionado(produto)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Botão flutuante do carrinho */}
      {quantidadeTotal > 0 && (
        <button
          onClick={() => setDrawerAberto(true)}
          className="fixed bottom-6 right-6 bg-cor-primaria text-cor-fundo px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2 font-medium border border-cor-destaque/20"
        >
          <span className="text-xl">🛒</span>
          <span className="bg-cor-fundo text-cor-texto text-sm px-2 py-0.5 rounded-full min-w-[24px] text-center">
            {quantidadeTotal}
          </span>
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
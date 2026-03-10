// LojaPublic.jsx - Versão com as cores do projeto
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProdutosPublic } from "../../../hooks/public/loja/useProdutosPublic";
import ProdutoCard from "../../../components/public/loja/ProdutoCard";
import { useCarrinho } from "../../../contexts/public/loja/CarrinhoContext";
import CarrinhoDrawer from "../../../components/public/loja/CarrinhoDrawer";
import ProdutoModal from "../../../components/public/loja/ProdutoModal";
import { usePublicSiteUrl } from "../../../hooks/public/loja/usePublicSiteUrl";

export default function LojaPublic() {
  const { slug } = useParams();
  const { produtos, carregando, erro } = useProdutosPublic(slug);
  const siteUrl = usePublicSiteUrl(slug);

  const { itens } = useCarrinho();
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [filtroModo, setFiltroModo] = useState("estoque");

  const quantidadeTotal = itens.reduce(
    (acc, item) => acc + item.quantidade,
    0
  );

  const produtosFiltrados = produtos.filter((produto) => {
    const possuiEstoque = Number(produto.possui_estoque) === 1;
    const possuiEncomenda = Number(produto.possui_encomenda ?? produto.encomenda) === 1;

    if (filtroModo === "estoque") return possuiEstoque;
    if (filtroModo === "encomenda") return possuiEncomenda;
    return true;
  });

  return (
    <div className="min-h-screen bg-cor-fundo">
      
      {/* Header com as cores do projeto */}
      <header className="bg-cor-secundaria border-b border-cor-primaria/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-cor-titulo">Loja</h1>
            <a
              href={siteUrl}
              className="text-sm px-3 py-1.5 rounded-lg border border-cor-primaria/30 text-cor-primaria hover:bg-cor-primaria/10 transition"
            >
              Voltar para o site
            </a>
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

        {!carregando && produtos.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { id: "estoque", label: "Em estoque" },
              { id: "encomenda", label: "Por encomenda" },
              { id: "todos", label: "Todos" },
            ].map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                onClick={() => setFiltroModo(opcao.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  filtroModo === opcao.id
                    ? "border-cor-primaria bg-cor-primaria text-cor-fundo"
                    : "border-cor-primaria/20 bg-cor-secundaria text-cor-texto/70 hover:border-cor-primaria/40"
                }`}
              >
                {opcao.label}
              </button>
            ))}
          </div>
        )}

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
              {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </div>

            {produtosFiltrados.length === 0 ? (
              <div className="bg-cor-secundaria/20 border border-cor-secundaria/30 rounded-lg p-10 text-center">
                <p className="text-cor-texto font-medium">
                  Nenhum produto encontrado neste modo.
                </p>
                <p className="mt-1 text-sm text-cor-texto/50">
                  Tente alternar entre estoque e encomenda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {produtosFiltrados.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    onSelecionar={() => setProdutoSelecionado(produto)}
                  />
                ))}
              </div>
            )}
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

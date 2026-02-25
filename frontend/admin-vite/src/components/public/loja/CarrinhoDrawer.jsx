import { useCarrinho } from "../../../contexts/public/loja/CarrinhoContext";
import { useNavigate, useParams } from "react-router-dom";  
import { useState } from "react";

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CarrinhoDrawer({ aberto, fechar }) {
  const { itens, removerItem, atualizarQuantidade } = useCarrinho();
  const navigate = useNavigate();
  const { slug } = useParams();
  const [itemRemovendo, setItemRemovendo] = useState(null);

  const subtotal = itens.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );

  const handleAumentar = (item) => {
    if (item.quantidade < (item.estoque || 10)) {
      atualizarQuantidade(item.skuId, item.quantidade + 1);
    }
  };

  const handleDiminuir = (item) => {
    if (item.quantidade > 1) {
      atualizarQuantidade(item.skuId, item.quantidade - 1);
    }
  };

  const handleRemover = (skuId) => {
    setItemRemovendo(skuId);
    // Pequeno delay para animação
    setTimeout(() => {
      removerItem(skuId);
      setItemRemovendo(null);
    }, 200);
  };

  return (
    <>
      {/* Overlay */}
      {aberto && (
        <div
          className="fixed inset-0 bg-cor-fundo/80 backdrop-blur-sm z-40"
          onClick={fechar}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-cor-fundo text-cor-texto shadow-2xl z-50 transform transition-transform duration-300 border-l border-cor-primaria/20 ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-cor-secundaria/30 flex justify-between items-center sticky top-0 bg-cor-fundo z-10">
          <h2 className="text-xl font-bold text-cor-titulo flex items-center gap-2">
            <span>🛒</span>
            Seu Carrinho
          </h2>
          <button 
            onClick={fechar}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cor-secundaria/50 transition text-cor-texto/60 hover:text-cor-texto"
            aria-label="Fechar carrinho"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Lista de itens */}
        <div className="p-5 space-y-4 overflow-y-auto h-[calc(100%-200px)]">
          {itens.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-6xl mb-4 text-cor-texto/20">🛒</span>
              <p className="text-cor-texto/50 font-medium text-lg">Seu carrinho está vazio</p>
              <p className="text-sm text-cor-texto/30 mt-2">
                Adicione produtos para começar
              </p>
              <button
                onClick={fechar}
                className="mt-6 bg-cor-primaria/10 hover:bg-cor-primaria/20 text-cor-primaria px-6 py-2 rounded-lg transition text-sm font-medium"
              >
                Continuar comprando
              </button>
            </div>
          )}

          {itens.map((item) => (
            <div
              key={item.skuId}
              className={`flex justify-between items-start border-b border-cor-secundaria/30 pb-4 last:border-0 group transition-all duration-200 ${
                itemRemovendo === item.skuId ? 'opacity-50 scale-95' : ''
              }`}
            >
              <div className="flex-1">
                <p className="font-medium text-cor-texto mb-1">{item.nome}</p>

                {/* Variações do item */}
                {item.variacoes && Object.keys(item.variacoes).length > 0 && (
                  <div className="space-y-1 text-sm mb-3">
                    {Object.entries(item.variacoes).map(([tipo, valor]) => (
                      <p key={tipo} className="text-cor-texto/60">
                        <span className="capitalize">{tipo}:</span> {valor}
                      </p>
                    ))}
                  </div>
                )}

                {/* Preço unitário */}
                <p className="text-xs text-cor-primaria/80 mb-2">
                  {formatarPreco(item.preco)} cada
                </p>

                {/* Controles de quantidade */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cor-texto/40">Quantidade:</span>
                  <div className="flex items-center border border-cor-secundaria/50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleDiminuir(item)}
                      disabled={item.quantidade <= 1}
                      className="w-8 h-8 flex items-center justify-center bg-cor-secundaria/20 hover:bg-cor-secundaria/40 disabled:opacity-30 disabled:cursor-not-allowed transition text-lg font-medium"
                      aria-label="Diminuir quantidade"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-medium bg-cor-fundo">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => handleAumentar(item)}
                      disabled={item.quantidade >= (item.estoque || 10)}
                      className="w-8 h-8 flex items-center justify-center bg-cor-secundaria/20 hover:bg-cor-secundaria/40 disabled:opacity-30 disabled:cursor-not-allowed transition text-lg font-medium"
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-cor-texto/30">
                    máx {item.estoque || 10}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 ml-4">
                <p className="font-bold text-cor-primaria text-lg whitespace-nowrap">
                  {formatarPreco(item.preco * item.quantidade)}
                </p>
                <button
                  onClick={() => handleRemover(item.skuId)}
                  className="text-xs text-cor-texto/40 hover:text-red-500 transition flex items-center gap-1"
                  aria-label="Remover item"
                >
                  <span className="text-base">🗑️</span>
                  <span>Remover</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer com total e checkout */}
        {itens.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-cor-secundaria/20 border-t border-cor-secundaria/30">
            {/* Resumo */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-cor-texto/60">Subtotal</span>
                <span className="text-cor-texto">{formatarPreco(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-cor-texto/60">Total de itens</span>
                <span className="text-cor-texto">
                  {itens.reduce((acc, item) => acc + item.quantidade, 0)} unidades
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-4 pt-2 border-t border-cor-secundaria/30">
              <span className="text-cor-texto font-medium">Total</span>
              <span className="text-2xl font-bold text-cor-primaria">
                {formatarPreco(subtotal)}
              </span>
            </div>

            <button
              onClick={() => navigate(`/loja/${slug}/checkout`)}
              className="w-full bg-cor-primaria hover:bg-cor-destaque text-cor-fundo font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <span>💰</span>
              Finalizar Pedido
            </button>

            <p className="text-xs text-center text-cor-texto/30 mt-3">
              Frete calculado no próximo passo
            </p>
          </div>
        )}
      </div>
    </>
  );
}
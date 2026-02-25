// ProdutoCard.jsx - Versão profissional
import React from "react";

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProdutoCard({ produto, onSelecionar }) {
  const indisponivel = Number(produto.quantidade_total) <= 0;

  const imagemCapa = produto.imagem_capa;

  return (
    <div className="group relative">
      <button
        onClick={() => {
          if (!indisponivel) onSelecionar(produto);
        }}
        disabled={indisponivel}
        className={`w-full text-left bg-white rounded-xl overflow-hidden transition-all duration-200
          ${indisponivel ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:-translate-y-1"}
          border border-gray-200 hover:border-gray-300`}
      >
        {/* Selo de desconto (exemplo) */}
        {!indisponivel && produto.desconto && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            -{produto.desconto}%
          </div>
        )}

        {/* Imagem */}
        <div className="relative w-full pt-[100%] bg-gray-100 rounded-t-xl overflow-hidden">
          {imagemCapa ? (
            <img
              src={imagemCapa}
              alt={produto.nome}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 text-sm">📸</span>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="p-3 space-y-2">
          
          {/* Categoria */}
          {produto.categoria && (
            <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {produto.categoria}
            </span>
          )}

          {/* Nome */}
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px]">
            {produto.nome}
          </h3>

          {/* Preço */}
          <div>
            <p className="text-xl font-bold text-gray-900">
              {formatarPreco(produto.preco_minimo)}
            </p>
            {produto.preco_original && (
              <p className="text-xs text-gray-400 line-through">
                {formatarPreco(produto.preco_original)}
              </p>
            )}
          </div>

          {/* Status */}
          {indisponivel ? (
            <p className="text-xs font-medium text-red-500 bg-red-50 py-1 px-2 rounded inline-block">
              Indisponível
            </p>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {produto.quantidade_total > 10 ? (
                <span>Em estoque</span>
              ) : (
                <span>Só {produto.quantidade_total} restantes!</span>
              )}
            </div>
          )}
        </div>
      </button>

      {/* Botão rápido (hover) */}
      {!indisponivel && (
        <button
          onClick={() => onSelecionar(produto)}
          className="absolute bottom-3 right-3 bg-yellow-400 text-gray-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-yellow-500"
        >
          <span className="text-sm">👁️</span>
        </button>
      )}
    </div>
  );
}
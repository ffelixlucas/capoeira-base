// ProdutoCard.jsx - Versão profissional
import React from "react";

function formatarPreco(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ProdutoCard({ produto, onSelecionar }) {
  const estoque = Number(produto.quantidade_total) || 0;
  const possuiEstoque = Number(produto.possui_estoque) === 1;
  const sobEncomenda = Number(produto.possui_encomenda ?? produto.encomenda) === 1;
  const precoMinimo = Number(produto.preco_minimo || 0);
  const precoMaximo = Number(produto.preco_maximo || produto.preco_minimo || 0);
  const temFaixaDePreco = precoMaximo > precoMinimo;

  const indisponivel = !sobEncomenda && !possuiEstoque;
  const imagemCapa = produto.imagem_capa;

  return (
    <div className="group relative h-full">
      <button
        onClick={() => {
          if (!indisponivel) onSelecionar(produto);
        }}
        disabled={indisponivel}
        className={`flex h-full w-full flex-col text-left bg-white rounded-xl overflow-hidden transition-all duration-200
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
        <div className="relative w-full pt-[100%] bg-cor-secundaria rounded-t-xl overflow-hidden">
          {imagemCapa ? (
            <img
              src={imagemCapa}
              alt={produto.nome}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <span className="text-gray-400 text-xs leading-relaxed">
                Imagem indisponivel no momento
              </span>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex min-h-[190px] flex-1 flex-col p-3">

          {/* Categoria */}
          {produto.categoria && (
            <span className="mb-2 inline-block w-fit text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {produto.categoria}
            </span>
          )}

          {/* Nome */}
          <h3 className="min-h-[40px] text-sm font-medium text-gray-800 line-clamp-2">
            {produto.nome}
          </h3>

          {/* Preço */}
          <div className="mt-3 min-h-[52px]">
            {temFaixaDePreco && (
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400">
                A partir de
              </p>
            )}
            <p className="text-xl font-bold text-gray-900">
              {formatarPreco(precoMinimo)}
            </p>
            {temFaixaDePreco && (
              <p className="text-xs text-gray-500">
                Preco varia conforme a opcao
              </p>
            )}
            {produto.preco_original && (
              <p className="text-xs text-gray-400 line-through">
                {formatarPreco(produto.preco_original)}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="mt-auto min-h-[32px] pt-3">
            {indisponivel ? (
              <p className="inline-block rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-500">
                Indisponível
              </p>
            ) : possuiEstoque && sobEncomenda ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-2 text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Em estoque</span>
                </span>
                <span className="inline-flex items-center gap-2 text-amber-600">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  <span>Também por encomenda</span>
                </span>
              </div>
            ) : sobEncomenda ? (
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span>Sob encomenda</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {estoque > 10 ? (
                  <span>Em estoque</span>
                ) : (
                  <span>Só {estoque} restantes!</span>
                )}
              </div>
            )}
          </div>
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

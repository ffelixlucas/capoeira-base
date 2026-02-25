import React, { useEffect, useMemo, useState } from "react";
import { useCarrinho } from "../../../contexts/public/loja/CarrinhoContext";
import { useParams } from "react-router-dom";
import { buscarProdutoPorId } from "../../../services/public/loja/lojaPublicService";
import GaleriaProduto from "./GaleriaProduto";

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
  const [carregando, setCarregando] = useState(false);
  const [selecoes, setSelecoes] = useState({});
  const [quantidade, setQuantidade] = useState(1);

  // 🔹 Buscar produto completo ao abrir modal
  useEffect(() => {
    if (!produto?.id || !slug) return;

    async function carregarProduto() {
      try {
        setCarregando(true);
        const response = await buscarProdutoPorId(slug, produto.id);

        if (response?.success) {
          setDadosProduto(response.data);
          setSelecoes({});
          setQuantidade(1);
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarProduto();
  }, [produto, slug]);

  // 🔹 Detectar tipo tamanho
  const tipoTamanho = useMemo(() => {
    if (!dadosProduto?.skus?.length) return null;

    const tipos = dadosProduto.skus.flatMap((sku) =>
      sku.variacoes?.map((v) => v.tipo) || []
    );

    return tipos.find((t) =>
      t.toLowerCase().includes("tamanho")
    ) || null;
  }, [dadosProduto]);

  // 🔹 Agrupamento inteligente
  const variacoesAgrupadas = useMemo(() => {
    if (!dadosProduto?.skus) return {};

    const mapa = {};

    dadosProduto.skus.forEach((sku) => {
      sku.variacoes?.forEach((v) => {
        if (!mapa[v.tipo]) mapa[v.tipo] = new Set();

        if (v.tipo === tipoTamanho) {
          mapa[v.tipo].add(v.valor);
        } else {
          if (!selecoes[tipoTamanho]) {
            mapa[v.tipo].add(v.valor);
          } else {
            const skuTemTamanho = sku.variacoes?.some(
              (vv) =>
                vv.tipo === tipoTamanho &&
                vv.valor === selecoes[tipoTamanho]
            );

            if (skuTemTamanho) mapa[v.tipo].add(v.valor);
          }
        }
      });
    });

    Object.keys(mapa).forEach((k) => {
      mapa[k] = Array.from(mapa[k]);
    });

    return mapa;
  }, [dadosProduto, selecoes, tipoTamanho]);

  // 🔹 SKU selecionado
  const skuSelecionado = useMemo(() => {
    if (!dadosProduto?.skus) return null;

    return dadosProduto.skus.find((sku) =>
      sku.variacoes?.every(
        (v) => selecoes[v.tipo] === v.valor
      )
    );
  }, [dadosProduto, selecoes]);

  useEffect(() => {
    if (skuSelecionado) {
      console.log("SKU SELECIONADO:", skuSelecionado);
    }
  }, [skuSelecionado]);

  // 🔹 Auto preencher quando só houver 1 combinação
  useEffect(() => {
    if (!dadosProduto?.skus || !tipoTamanho) return;

    const tamanhoSelecionado = selecoes[tipoTamanho];
    if (!tamanhoSelecionado) return;

    const skusFiltradas = dadosProduto.skus.filter((sku) =>
      sku.variacoes?.some(
        (v) =>
          v.tipo === tipoTamanho &&
          v.valor === tamanhoSelecionado
      )
    );

    if (skusFiltradas.length === 1) {
      const unicaSku = skusFiltradas[0];

      const novasSelecoes = {};
      unicaSku.variacoes.forEach((v) => {
        novasSelecoes[v.tipo] = v.valor;
      });

      setSelecoes(novasSelecoes);
    }
  }, [selecoes[tipoTamanho], dadosProduto, tipoTamanho]);

  if (!produto) return null;

  return (
    <>
      {/* Overlay com blur - usando cor-fundo com opacidade */}
      <div
        className="fixed inset-0 bg-cor-fundo/80 z-40 backdrop-blur-sm"
        onClick={fechar}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
        <div className="bg-cor-fundo text-cor-texto w-full max-w-6xl rounded-2xl shadow-2xl relative max-h-[90vh] overflow-auto border border-cor-secundaria/30">
          
          {/* Header fixo */}
          <div className="sticky top-0 bg-cor-fundo border-b border-cor-secundaria/30 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-cor-titulo">
              {dadosProduto?.nome || "Carregando..."}
            </h2>
            <button
              onClick={fechar}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cor-secundaria/50 transition text-cor-texto/60 hover:text-cor-texto"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {carregando && (
              <div className="py-20 flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-cor-primaria border-t-transparent rounded-full animate-spin"></div>
                <p className="text-cor-texto/60 mt-4">Carregando produto...</p>
              </div>
            )}

            {!carregando && dadosProduto && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Galeria */}
                <GaleriaProduto
                  produto={dadosProduto}
                  skuSelecionado={skuSelecionado}
                />

                {/* Informações */}
                <div className="space-y-6">
                  
                  {/* Descrição */}
                  <div>
                    <h2 className="text-2xl font-bold text-cor-titulo mb-2">
                      {dadosProduto.nome}
                    </h2>
                    <p className="text-cor-texto/80 leading-relaxed">
                      {dadosProduto.descricao}
                    </p>
                  </div>

                  {/* Variações */}
                  {Object.keys(variacoesAgrupadas).length > 0 && (
                    <div className="space-y-4">
                      {Object.keys(variacoesAgrupadas).map((tipo) => (
                        <div key={tipo}>
                          <p className="text-sm font-medium text-cor-texto/60 mb-2 capitalize">
                            {tipo}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {variacoesAgrupadas[tipo].map((valor) => (
                              <button
                                key={valor}
                                onClick={() => {
                                  setSelecoes((prev) => ({
                                    ...prev,
                                    [tipo]: valor,
                                  }));
                                  setQuantidade(1);
                                }}
                                className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                                  selecoes[tipo] === valor
                                    ? "bg-cor-primaria border-cor-primaria text-cor-fundo"
                                    : "bg-transparent border-cor-secundaria/50 text-cor-texto hover:border-cor-primaria"
                                }`}
                              >
                                {valor}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preço e quantidade */}
                  {skuSelecionado && (
                    <div className="border-t border-cor-secundaria/30 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-cor-texto/40">Preço</p>
                          <p className="text-3xl font-bold text-cor-primaria">
                            {formatarPreco(skuSelecionado.preco)}
                          </p>
                        </div>
                        
                        {/* Seletor quantidade */}
                        {skuSelecionado.quantidade_disponivel > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-cor-texto/60">Qtd:</span>
                            <select
                              value={quantidade}
                              onChange={(e) => setQuantidade(Number(e.target.value))}
                              className="border border-cor-secundaria/50 rounded-lg px-3 py-2 bg-cor-fundo text-cor-texto focus:outline-none focus:ring-2 focus:ring-cor-primaria"
                            >
                              {[...Array(Math.min(skuSelecionado.quantidade_disponivel, 10))].map((_, i) => {
                                const valor = i + 1;
                                return (
                                  <option key={valor} value={valor}>
                                    {valor}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Botão adicionar */}
                      <button
                        disabled={!skuSelecionado || skuSelecionado.quantidade_disponivel <= 0}
                        onClick={() => {
                          adicionarItem({
                            skuId: skuSelecionado.id,
                            nome: dadosProduto.nome,
                            preco: skuSelecionado.preco,
                            variacoes: selecoes,
                            quantidade: quantidade,
                          });
                          fechar();
                        }}
                        className="w-full bg-cor-primaria hover:bg-cor-destaque text-cor-fundo font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <span className="text-xl">🛒</span>
                        {skuSelecionado.quantidade_disponivel > 0 
                          ? 'Adicionar ao carrinho' 
                          : 'produto indisponível'}
                      </button>

                      {/* Info estoque */}
                      <p className="text-xs text-center text-cor-texto/40 mt-3">
                        {skuSelecionado.quantidade_disponivel > 0 
                          ? `${skuSelecionado.quantidade_disponivel} unidades disponíveis` 
                          : 'Produto temporariamente indisponível'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
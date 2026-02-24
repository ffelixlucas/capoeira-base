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
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={fechar}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
        <div className="bg-white text-black w-full max-w-6xl rounded-xl shadow-lg p-6 relative">

          <button
            onClick={fechar}
            className="absolute top-3 right-3 text-gray-500 text-xl"
          >
            ✕
          </button>

          {carregando && (
            <div className="py-20 text-center text-gray-500">
              Carregando produto...
            </div>
          )}

          {!carregando && dadosProduto && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              <GaleriaProduto
                produto={dadosProduto}
                skuSelecionado={skuSelecionado}
              />

              <div>

                <h2 className="text-2xl font-bold mb-2">
                  {dadosProduto.nome}
                </h2>

                <p className="text-gray-600 mb-6">
                  {dadosProduto.descricao}
                </p>

                {Object.keys(variacoesAgrupadas).map((tipo) => (
                  <div key={tipo} className="mb-6">
                    <p className="text-sm font-medium mb-2 capitalize">
                      Escolha {tipo}:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {variacoesAgrupadas[tipo].map((valor) => (
                        <button
                          key={valor}
                          onClick={() =>
                            setSelecoes((prev) => ({
                              ...prev,
                              [tipo]: valor,
                            }))
                          }
                          className={`px-3 py-2 border rounded text-sm transition ${
                            selecoes[tipo] === valor
                              ? "bg-black text-white border-black"
                              : "bg-white hover:border-black"
                          }`}
                        >
                          {valor}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {skuSelecionado && (
                  <p className="text-3xl font-bold mb-6">
                    {formatarPreco(skuSelecionado.preco)}
                  </p>
                )}

                <button
                  disabled={!skuSelecionado}
                  onClick={() => {
                    adicionarItem({
                      skuId: skuSelecionado.id,
                      nome: dadosProduto.nome,
                      preco: skuSelecionado.preco,
                      variacoes: selecoes,
                    });
                    fechar();
                  }}
                  className="w-full bg-black text-white py-4 rounded text-lg disabled:opacity-50 transition"
                >
                  Adicionar ao carrinho
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
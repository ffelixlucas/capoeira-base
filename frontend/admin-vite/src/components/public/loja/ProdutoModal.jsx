import React, { useEffect, useMemo, useState } from "react";
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
  const [carregando, setCarregando] = useState(false);
  const [selecoes, setSelecoes] = useState({});

  // 🔥 Detecta qual é o tipo "tamanho"
  const tipoTamanho = useMemo(() => {
    if (!dadosProduto?.skus?.length) return null;

    const tipos = dadosProduto.skus.flatMap((sku) =>
      sku.variacoes?.map((v) => v.tipo) || []
    );

    return tipos.find((t) =>
      t.toLowerCase().includes("tamanho")
    ) || null;
  }, [dadosProduto]);

  // 🔥 Agrupamento inteligente
  const variacoesAgrupadas = useMemo(() => {
    if (!dadosProduto?.skus) return {};

    const mapa = {};

    dadosProduto.skus.forEach((sku) => {
      sku.variacoes?.forEach((v) => {
        if (!mapa[v.tipo]) {
          mapa[v.tipo] = new Set();
        }

        // 🔥 Se for tamanho → sempre mostrar
        if (v.tipo === tipoTamanho) {
          mapa[v.tipo].add(v.valor);
        } 
        // 🔥 Se for outro tipo → filtrar pelo tamanho selecionado
        else {
          if (!selecoes[tipoTamanho]) {
            mapa[v.tipo].add(v.valor);
          } else {
            const skuTemTamanhoSelecionado = sku.variacoes?.some(
              (vv) =>
                vv.tipo === tipoTamanho &&
                vv.valor === selecoes[tipoTamanho]
            );

            if (skuTemTamanhoSelecionado) {
              mapa[v.tipo].add(v.valor);
            }
          }
        }
      });
    });

    Object.keys(mapa).forEach((k) => {
      mapa[k] = Array.from(mapa[k]);
    });

    return mapa;
  }, [dadosProduto, selecoes, tipoTamanho]);

  // 🔥 SKU selecionado automático
  const skuSelecionado = useMemo(() => {
    if (!dadosProduto?.skus) return null;

    return dadosProduto.skus.find((sku) =>
      sku.variacoes?.every(
        (v) => selecoes[v.tipo] === v.valor
      )
    );
  }, [dadosProduto, selecoes]);

  // 🔥 Limpa seleção inválida automaticamente
  useEffect(() => {
    if (!dadosProduto || !tipoTamanho) return;

    const tamanhoSelecionado = selecoes[tipoTamanho];
    if (!tamanhoSelecionado) return;

    const nomesValidos = dadosProduto.skus
      .filter((sku) =>
        sku.variacoes?.some(
          (v) =>
            v.tipo === tipoTamanho &&
            v.valor === tamanhoSelecionado
        )
      )
      .flatMap((sku) =>
        sku.variacoes?.filter(
          (v) => v.tipo !== tipoTamanho
        ) || []
      )
      .map((v) => v.valor);

    Object.entries(selecoes).forEach(([tipo, valor]) => {
      if (
        tipo !== tipoTamanho &&
        !nomesValidos.includes(valor)
      ) {
        setSelecoes((prev) => {
          const novo = { ...prev };
          delete novo[tipo];
          return novo;
        });
      }
    });
  }, [selecoes, dadosProduto, tipoTamanho]);

  useEffect(() => {
    if (!produto) return;

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

  if (!produto) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={fechar}
      />

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

          <h2 className="text-lg font-bold mb-1">
            {dadosProduto?.nome}
          </h2>

          <p className="text-gray-600 mb-4">
            {dadosProduto?.descricao}
          </p>

          {carregando && (
            <p className="text-gray-500 text-sm">
              Carregando opções...
            </p>
          )}

          {!carregando &&
            Object.keys(variacoesAgrupadas).map((tipo) => (
              <div key={tipo} className="mb-4">
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
                      className={`px-3 py-1 border rounded text-sm transition ${
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
            <p className="text-xl font-bold mb-4">
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
            className="w-full bg-black text-white py-2 rounded disabled:opacity-50 transition"
          >
            Adicionar ao carrinho
          </button>

        </div>
      </div>
    </>
  );
}
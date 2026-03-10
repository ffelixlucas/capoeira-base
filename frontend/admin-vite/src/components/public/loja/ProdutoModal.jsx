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

function normalizarTamanho(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function obterPesoTamanho(valor) {
  const normalizado = normalizarTamanho(valor);
  const ordemFixa = {
    "0": 0,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "6": 6,
    "8": 8,
    "10": 10,
    "12": 12,
    "14": 14,
    "16": 16,
    "PP": 100,
    "XP": 100,
    "P": 110,
    "M": 120,
    "G": 130,
    "GG": 140,
    "XG": 150,
    "XGG": 160,
    "EXG": 160,
    "EG": 150,
    "EXGG": 170,
    "G1": 180,
    "G2": 190,
    "G3": 200,
    "G4": 210,
  };

  if (ordemFixa[normalizado] !== undefined) {
    return ordemFixa[normalizado];
  }

  if (/^\d+$/.test(normalizado)) {
    return Number(normalizado);
  }

  return 1000;
}

function ordenarValoresVariacao(tipo, valores, tipoTamanho) {
  const lista = [...valores];

  if (tipo === tipoTamanho) {
    return lista.sort((a, b) => {
      const pesoA = obterPesoTamanho(a);
      const pesoB = obterPesoTamanho(b);

      if (pesoA !== pesoB) return pesoA - pesoB;
      return String(a).localeCompare(String(b), "pt-BR", { numeric: true });
    });
  }

  return lista.sort((a, b) =>
    String(a).localeCompare(String(b), "pt-BR", { numeric: true })
  );
}

function formatarNomeTipo(tipo) {
  return String(tipo || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

export default function ProdutoModal({ produto, fechar }) {
  const { slug } = useParams();
  const { adicionarItem } = useCarrinho();

  const [dadosProduto, setDadosProduto] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [selecoes, setSelecoes] = useState({});
  const [quantidade, setQuantidade] = useState(1);
  const [avisosVariacao, setAvisosVariacao] = useState({});

  function handleSelecionarVariacao(tipo, valor) {
    const jaSelecionado = selecoes[tipo] === valor;

    if (jaSelecionado) {
      if (tipo === tipoTamanho) {
        setSelecoes({});
        setQuantidade(1);
        setAvisosVariacao({});
        return;
      }

      const proximasSelecoes = { ...selecoes };
      delete proximasSelecoes[tipo];

      const skusCompativeis = (dadosProduto?.skus || []).filter((sku) =>
        Object.entries(proximasSelecoes).every(([tipoSelecionado, valorSelecionado]) =>
          sku.variacoes?.some(
            (variacao) =>
              variacao.tipo === tipoSelecionado &&
              variacao.valor === valorSelecionado
          )
        )
      );

      const existeAlternativaSemEssaMarcacao = skusCompativeis.some((sku) => {
        const variacaoDoTipo = sku.variacoes?.find((variacao) => variacao.tipo === tipo);

        return !variacaoDoTipo || variacaoDoTipo.valor !== valor;
      });

      if (!existeAlternativaSemEssaMarcacao) {
        const tamanhoSelecionado = selecoes[tipoTamanho];
        const detalheTipo =
          String(valor).toLowerCase() === "sim"
            ? formatarNomeTipo(tipo)
            : `${formatarNomeTipo(tipo)}: ${valor}`;

        setAvisosVariacao((prev) => ({
          ...prev,
          [tipo]: tamanhoSelecionado
            ? `Em estoque, o tamanho ${tamanhoSelecionado} so esta disponivel em ${detalheTipo}.`
            : `Em estoque, esta versao so esta disponivel em ${detalheTipo}.`,
        }));
        return;
      }

      setSelecoes(proximasSelecoes);
      setQuantidade(1);
      setAvisosVariacao((prev) => {
        const proximosAvisos = { ...prev };
        delete proximosAvisos[tipo];
        return proximosAvisos;
      });
      return;
    }

    if (tipo === tipoTamanho) {
      setSelecoes({
        [tipo]: valor,
      });
      setQuantidade(1);
      setAvisosVariacao({});
      return;
    }

    setSelecoes((prev) => ({
      ...prev,
      [tipo]: valor,
    }));
    setQuantidade(1);
    setAvisosVariacao((prev) => {
      const proximosAvisos = { ...prev };
      delete proximosAvisos[tipo];
      return proximosAvisos;
    });
  }

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
          setAvisosVariacao({});
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
            // Antes de escolher tamanho, só mostramos o próprio tamanho
            if (v.tipo === tipoTamanho) {
              mapa[v.tipo].add(v.valor);
            }

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
      mapa[k] = ordenarValoresVariacao(
        k,
        Array.from(mapa[k]),
        tipoTamanho
      );
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

  const possuiPrecosDiferentes = useMemo(() => {
    if (!dadosProduto?.skus?.length) return false;

    const precos = new Set(
      dadosProduto.skus.map((sku) => Number(sku.preco).toFixed(2))
    );

    return precos.size > 1;
  }, [dadosProduto]);

  useEffect(() => {
    if (skuSelecionado) {
      console.log("SKU SELECIONADO:", skuSelecionado);
    }
  }, [skuSelecionado]);

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

                  {possuiPrecosDiferentes && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/8 px-3 py-1.5 text-xs text-sky-200/90">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-sky-300/40 text-[10px] font-semibold">
                        i
                      </span>
                      <span>
                        Algumas variacoes possuem valor diferente. O preco atualiza automaticamente.
                      </span>
                    </div>
                  )}

                  {/* Variações */}
                  {Object.keys(variacoesAgrupadas).length > 0 && (
                    <div className="space-y-4">
                      {Object.keys(variacoesAgrupadas)
                        .filter((tipo) => variacoesAgrupadas[tipo].length > 0)
                        .map((tipo) => (
                          <div key={tipo}>
                            <p className="text-sm font-medium text-cor-texto/60 mb-2 capitalize">
                              {tipo}:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {variacoesAgrupadas[tipo].map((valor) => (
                                <button
                                  key={valor}
                                  onClick={() => handleSelecionarVariacao(tipo, valor)}
                                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${selecoes[tipo] === valor
                                    ? "bg-cor-primaria border-cor-primaria text-cor-fundo"
                                    : "bg-transparent border-cor-secundaria/50 text-cor-texto hover:border-cor-primaria"
                                    }`}
                                >
                                  {valor}
                                </button>
                              ))}
                            </div>

                            {avisosVariacao[tipo] && (
                              <p className="mt-2 text-sm font-medium text-red-500">
                                {avisosVariacao[tipo]}
                              </p>
                            )}
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
                        disabled={
                          !skuSelecionado ||
                          (!skuSelecionado.encomenda && skuSelecionado.quantidade_disponivel <= 0)
                        } onClick={() => {
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
                        {skuSelecionado.encomenda === 1
                          ? 'Encomendar produto'
                          : skuSelecionado.quantidade_disponivel > 0
                            ? 'Adicionar ao carrinho'
                            : 'Produto indisponível'}
                      </button>

                      {/* Info estoque */}
                      {skuSelecionado.encomenda === 1 ? (
                        <div className="bg-amber-50 border border-amber-300 text-amber-700 text-xs text-center py-2 px-3 rounded-lg mt-3">
                          Produto sob encomenda. O prazo será informado após a confirmação do pedido.
                        </div>
                      ) : skuSelecionado.quantidade_disponivel > 0 ? (
                        <p className="text-xs text-center text-cor-texto/40 mt-3">
                          {skuSelecionado.quantidade_disponivel === 1
                            ? "1 unidade disponível"
                            : `${skuSelecionado.quantidade_disponivel} unidades disponíveis`}
                        </p>
                      ) : (
                        <p className="text-xs text-center text-red-500 mt-3">
                          Produto temporariamente indisponível
                        </p>
                      )}
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

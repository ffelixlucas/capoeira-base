// SkuLinha.jsx - Versão com classes admin e nome oculto quando vazio
import { useEffect, useState } from "react";
import { produtosService } from "../../../services/produtosService";
import { variacoesService } from "../../../services/variacoesService";
import { toast } from "react-toastify";
import SkuGaleria from "./SkuGaleria";
import SkuEditarModal from "./SkuEditarModal";

function humanizarTipo(tipo = "") {
  const normalizado = String(tipo).trim().toLowerCase();

  if (normalizado === "tamanho") return "Tamanho";
  if (normalizado === "cor") return "Cor";
  if (normalizado === "nome_camisa") return "Personalização";

  return String(tipo)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}

function formatarVariacaoResumo(variacao) {
  const tipo = humanizarTipo(variacao.tipo);
  const valor = String(variacao.valor || "").trim();

  if (!valor) return tipo;
  if (valor.toLowerCase() === "sim") return tipo;

  return `${tipo}: ${valor}`;
}

export default function SkuLinha({ sku, imagensReaproveitaveis = [], onAtualizado }) {
  const isInativa = Number(sku.ativo) === 0;
  const [preco, setPreco] = useState(Number(sku.preco));
  const [estoque, setEstoque] = useState(Number(sku.quantidade));
  const [permitirEncomenda, setPermitirEncomenda] = useState(
    Boolean(sku.encomenda)
  );
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [carregandoTamanhos, setCarregandoTamanhos] = useState(false);
  const [tipoTamanhoId, setTipoTamanhoId] = useState(null);
  const [tamanhosDisponiveis, setTamanhosDisponiveis] = useState([]);
  const [tamanhoSelecionadoId, setTamanhoSelecionadoId] = useState("");
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);

  const variacoes = sku.variacoes || [];
  const prioridadeTipos = ["tamanho", "cor", "nome_camisa"];
  const variacoesOrdenadas = [...variacoes].sort((a, b) => {
    const prioridadeA = prioridadeTipos.indexOf(String(a.tipo).toLowerCase());
    const prioridadeB = prioridadeTipos.indexOf(String(b.tipo).toLowerCase());

    const ordemA = prioridadeA === -1 ? prioridadeTipos.length : prioridadeA;
    const ordemB = prioridadeB === -1 ? prioridadeTipos.length : prioridadeB;

    if (ordemA !== ordemB) return ordemA - ordemB;
    return String(a.tipo).localeCompare(String(b.tipo));
  });
  const resumoCabecalho =
    variacoesOrdenadas.map(formatarVariacaoResumo).join(" • ") || "Sem variações definidas";
  const codigoSku = sku.sku_codigo || `#${sku.id}`;
  const skuSemTamanho = !variacoesOrdenadas.some(
    (variacao) => String(variacao.tipo).trim().toLowerCase() === "tamanho"
  );

  const getCorStyle = (corNome) => {
    if (!corNome) return {};

    const corLower = corNome.toLowerCase().trim();

    const coresMap = {
      'amarelo': '#FFD700',
      'vermelho': '#FF0000',
      'azul': '#0000FF',
      'verde': '#00FF00',
      'preto': '#000000',
      'branco': '#FFFFFF',
      'rosa': '#FF69B4',
      'roxo': '#800080',
      'laranja': '#FFA500',
      'marrom': '#8B4513',
      'cinza': '#808080',
      'bege': '#F5F5DC',
      'vinho': '#800000',
      'dourado': '#DAA520',
      'prata': '#C0C0C0'
    };

    if (coresMap[corLower]) {
      return { backgroundColor: coresMap[corLower] };
    }

    if (corLower.startsWith('#')) {
      return { backgroundColor: corLower };
    }

    if (corLower.startsWith('rgb')) {
      return { backgroundColor: corLower };
    }

    return { backgroundColor: '#CCCCCC' };
  };

  async function salvar() {
    if (preco <= 0) {
      toast.warning("Preço precisa ser maior que zero");
      return;
    }
    if (estoque < 0) {
      toast.warning("Estoque não pode ser negativo");
      return;
    }

    try {
      setLoading(true);
      await produtosService.atualizarSku(sku.id, {
        preco: Number(preco),
        encomenda: permitirEncomenda ? 1 : 0,
      }); await produtosService.atualizarEstoque(sku.id, { quantidade: Number(estoque) });
      toast.success("Variação atualizada!");
      onAtualizado();
      setIsExpanded(false);
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  }

  async function desativarVenda() {
    const confirmar = window.confirm(
      "Esta variação ficará indisponível para venda.\n\nDeseja continuar?"
    );
  
    if (!confirmar) return;
  
    try {
      setLoading(true);
      await produtosService.desativarSku(sku.id);
      toast.success("Variação desativada!");
      onAtualizado();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erro ao desativar"
      );
    } finally {
      setLoading(false);
    }
  }

  async function excluirSku() {
    let mensagem;

    if (sku.possuiPedidos) {
      mensagem =
        "Esta variação já possui pedidos registrados.\n\n" +
        "Ela NÃO pode ser excluída definitivamente.\n\n" +
        "Ela será apenas removida da loja e ficará indisponível para novas vendas.\n\n" +
        "Deseja continuar?";
    } else {
      mensagem =
        "Esta variação será excluída permanentemente.\n\n" +
        "Essa ação NÃO pode ser desfeita.\n\n" +
        "Deseja continuar?";
    }

    const confirmar = window.confirm(mensagem);
    if (!confirmar) return;

    try {
      setLoading(true);
      await produtosService.deletarSku(sku.id);
      toast.success(
        sku.possuiPedidos
          ? "Variação removida da loja com sucesso!"
          : "Variação excluída permanentemente!"
      );
      onAtualizado();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erro ao excluir variação"
      );
    } finally {
      setLoading(false);
    }
  }

  async function reativarVenda() {
    const confirmar = window.confirm(
      "Esta variação voltará a ficar disponível para venda.\n\nDeseja continuar?"
    );

    if (!confirmar) return;

    try {
      setLoading(true);
      await produtosService.reativarSku(sku.id);
      toast.success("Variação reativada com sucesso!");
      onAtualizado();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erro ao reativar variação"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function carregarTamanhos() {
      if (!isExpanded || !skuSemTamanho) return;

      try {
        setCarregandoTamanhos(true);
        const tipos = await variacoesService.listarTipos();
        const tipoTamanho = (tipos || []).find(
          (tipo) => String(tipo.nome || "").trim().toLowerCase() === "tamanho"
        );

        if (!tipoTamanho) {
          setTipoTamanhoId(null);
          setTamanhosDisponiveis([]);
          setTamanhoSelecionadoId("");
          return;
        }

        setTipoTamanhoId(tipoTamanho.id);
        const valores = await variacoesService.listarValores(tipoTamanho.id);
        setTamanhosDisponiveis(valores || []);
        setTamanhoSelecionadoId((valores || [])[0]?.id ? String((valores || [])[0].id) : "");
      } catch {
        toast.error("Erro ao carregar tamanhos");
      } finally {
        setCarregandoTamanhos(false);
      }
    }

    carregarTamanhos();
  }, [isExpanded, skuSemTamanho]);

  async function adicionarTamanhoNaSku() {
    if (!tamanhoSelecionadoId) {
      toast.warning("Selecione um tamanho");
      return;
    }

    try {
      setLoading(true);
      await produtosService.adicionarVariacaoSku(sku.id, Number(tamanhoSelecionadoId));
      toast.success("Tamanho adicionado na variação");
      onAtualizado();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erro ao adicionar tamanho"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-cor-secundaria rounded-xl border-2 border-cor-secundaria/30 overflow-hidden mb-3 shadow-sm">

      {/* CABEÇALHO - Tamanho como título + estoque + seta */}
      <div
        className="p-4 flex items-center justify-between border-b-2 border-cor-secundaria/30 cursor-pointer hover:bg-cor-secundaria/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface/45">
              SKU {codigoSku}
            </span>

            {isInativa && (
              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 font-bold">
                INATIVA
              </span>
            )}
          </div>

          <div className="mt-2 pr-3 text-sm font-semibold text-on-surface leading-relaxed">
            {resumoCabecalho}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setModalEdicaoAberto(true);
            }}
            className="rounded-lg border border-cor-secundaria/40 px-2.5 py-1 text-xs font-semibold text-on-surface/70 hover:bg-cor-secundaria/10 transition"
          >
            Editar
          </button>
          <span className={`text-sm font-medium ${estoque === 0 ? 'text-red-500' :
            estoque < 5 ? 'text-yellow-500' :
              'text-green-500'
            }`}>
            {estoque} un
          </span>
          <svg
            className={`w-5 h-5 text-on-surface/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-4 space-y-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface/45">
            Variações desta versão
          </span>

          {variacoesOrdenadas.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {variacoesOrdenadas.map((variacao, index) => {
                const tipoNormalizado = String(variacao.tipo).toLowerCase();
                const exibirSwatch = tipoNormalizado === "cor" && variacao.valor;

                return (
                  <div
                    key={`${variacao.tipo}-${variacao.valor}-${index}`}
                    className="inline-flex items-center gap-2 rounded-full border border-cor-secundaria/25 bg-cor-fundo px-3 py-1.5 text-sm text-on-surface"
                  >
                    {exibirSwatch && (
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-cor-secundaria/30"
                        style={getCorStyle(variacao.valor)}
                        title={`Cor: ${variacao.valor}`}
                      />
                    )}
                    <span className="font-semibold text-on-surface/70">
                      {humanizarTipo(variacao.tipo)}
                    </span>
                    <span className="font-medium">
                      {String(variacao.valor).toLowerCase() === "sim"
                        ? "Marcado"
                        : variacao.valor}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-2 text-sm text-on-surface/50">
              Nenhuma variação identificada nesta versão.
            </div>
          )}
        </div>

        {/* Preço */}
        <div className="flex items-start">
          <span className="text-xs text-on-surface/40 w-16 font-medium">Preço:</span>
          <span className="text-xl font-bold text-cor-primaria">R$ {Number(preco).toFixed(2)}</span>
        </div>

        {/* Estoque */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface/40 font-medium">
              Estoque:
            </span>

            <span
              className={`text-xl font-bold ${estoque === 0
                ? "text-red-500"
                : estoque < 5
                  ? "text-yellow-500"
                  : "text-green-500"
                }`}
            >
              {estoque}
            </span>
          </div>
        </div>

        {/* Imagens da variação */}
        <div className="mt-3">
          <SkuGaleria
            sku={sku}
            imagensReaproveitaveis={imagensReaproveitaveis}
            onAtualizado={onAtualizado}
          />
        </div>
      </div>

      {/* MODO EDIÇÃO */}
      {isExpanded && (
        <div className="border-t-2 border-cor-secundaria/30 p-4 bg-cor-fundo">
          <div className="space-y-4">

            <p className="text-sm font-bold text-on-surface/70">EDITAR VARIAÇÃO</p>

            <div className="space-y-4">

              {skuSemTamanho && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs font-semibold text-amber-600 mb-2">
                    Esta SKU está sem tamanho.
                  </p>
                  {carregandoTamanhos ? (
                    <p className="text-xs text-on-surface/60">Carregando tamanhos...</p>
                  ) : !tipoTamanhoId ? (
                    <p className="text-xs text-on-surface/60">
                      Tipo "Tamanho" não encontrado em Gerenciar tipos e valores.
                    </p>
                  ) : tamanhosDisponiveis.length === 0 ? (
                    <p className="text-xs text-on-surface/60">
                      Não há valores de tamanho cadastrados.
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-end gap-2">
                      <div>
                        <label className="block text-xs text-on-surface/40 font-medium mb-1">
                          Tamanho
                        </label>
                        <select
                          value={tamanhoSelecionadoId}
                          onChange={(event) => setTamanhoSelecionadoId(event.target.value)}
                          className="input-number-admin min-w-[120px]"
                        >
                          {tamanhosDisponiveis.map((valor) => (
                            <option key={valor.id} value={valor.id}>
                              {valor.valor}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={adicionarTamanhoNaSku}
                        disabled={loading || !tamanhoSelecionadoId}
                        className="py-2 px-3 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition"
                      >
                        Adicionar tamanho
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Linha compacta */}
              <div className="flex gap-4">

                <div className="w-32">
                  <label className="block text-xs text-on-surface/40 font-medium mb-1">
                    Preço
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    className="input-number-admin"
                  />
                </div>

                <div className="w-28">
                  <label className="block text-xs text-on-surface/40 font-medium mb-1">
                    Estoque
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    className="input-number-admin"
                  />
                </div>

              </div>

              {/* Encomenda */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={permitirEncomenda}
                  onChange={(e) => setPermitirEncomenda(e.target.checked)}
                  className="w-4 h-4 accent-cor-primaria"
                />
                <label className="text-sm text-on-surface/70">
                  Permitir encomenda quando zerar estoque
                </label>
              </div>

            </div>

            <div className="flex gap-2 pt-2">

<button
  onClick={salvar}
  disabled={loading}
  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-cor-primaria text-white hover:bg-cor-primaria/90 disabled:opacity-50 transition"
>
  {loading ? "Salvando..." : "Salvar"}
</button>

<button
  onClick={() => setIsExpanded(false)}
  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-surface text-on-surface border border-cor-secundaria/40 hover:bg-cor-secundaria/5 transition"
>
  Cancelar
</button>

{/* BOTÃO DESATIVAR / REATIVAR */}
<button
  onClick={
    Number(sku.ativo) === 0
      ? reativarVenda
      : desativarVenda
  }
  disabled={loading}
  className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition disabled:opacity-50 ${
    Number(sku.ativo) === 0
      ? "border-cor-primaria text-cor-primaria hover:bg-cor-primaria/10"
      : "border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
  }`}
>
  {Number(sku.ativo) === 0
    ? "Reativar venda"
    : "Desativar"}
</button>

{/* BOTÃO EXCLUIR PERMANENTE (somente se permitido) */}
{!sku.possuiPedidos && (
  <button
    onClick={excluirSku}
    disabled={loading}
    className="flex-1 py-2 text-sm font-semibold rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition disabled:opacity-50"
  >
    Excluir permanente
  </button>
)}

</div>
          </div>
        </div>
      )}

      {modalEdicaoAberto && (
        <SkuEditarModal
          sku={sku}
          onClose={() => setModalEdicaoAberto(false)}
          onSaved={onAtualizado}
        />
      )}
    </div>
  );
}

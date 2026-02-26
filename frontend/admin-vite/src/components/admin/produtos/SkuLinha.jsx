// SkuLinha.jsx - Versão com classes admin e nome oculto quando vazio
import { useState } from "react";
import { produtosService } from "../../../services/produtosService";
import { toast } from "react-toastify";
import SkuGaleria from "./SkuGaleria";

export default function SkuLinha({ sku, onAtualizado }) {
  const isInativa = Number(sku.ativo) === 0;
  const [preco, setPreco] = useState(Number(sku.preco));
  const [estoque, setEstoque] = useState(Number(sku.quantidade));
  const [permitirEncomenda, setPermitirEncomenda] = useState(
    Boolean(sku.encomenda)
  );
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const variacoes = sku.variacoes || [];
  const tamanho = variacoes.find(v => v.tipo === "tamanho")?.valor || "—";
  const cor = variacoes.find(v => v.tipo === "cor")?.valor || null;
  const nomeCamisa = variacoes.find(v => v.tipo === "nome_camisa")?.valor || null; // Mudado para null quando não existe

  const outrasVariacoes = variacoes.filter(v =>
    v.tipo !== "tamanho" && v.tipo !== "cor" && v.tipo !== "nome_camisa"
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
    } catch (error) {
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

  return (
    <div className="bg-cor-secundaria rounded-xl border-2 border-cor-secundaria/30 overflow-hidden mb-3 shadow-sm">

      {/* CABEÇALHO - Tamanho como título + estoque + seta */}
      <div
        className="p-4 flex items-center justify-between border-b-2 border-cor-secundaria/30 cursor-pointer hover:bg-cor-secundaria/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-cor-primaria">
            Tamanho: {tamanho}
          </span>

          {isInativa && (
            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 font-bold">
              INATIVA
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
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

        {/* Cor (se existir) */}
        {cor && (
          <div className="flex items-start">
            <span className="text-xs text-on-surface/40 w-16 font-medium">Cor:</span>
            <div className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full border-2 border-cor-secundaria/40 shadow-sm"
                style={getCorStyle(cor)}
                title={`Cor: ${cor}`}
              />
              <span className="text-base text-on-surface capitalize font-medium">{cor}</span>
            </div>
          </div>
        )}

        {/* Outras variações */}
        {outrasVariacoes.map((v, index) => (
          <div key={index} className="flex items-start">
            <span className="text-xs text-on-surface/40 w-16 font-medium capitalize">{v.tipo}:</span>
            <span className="text-base text-on-surface capitalize font-medium">{v.valor}</span>
          </div>
        ))}

        {/* Nome - SÓ MOSTRA SE TIVER VALOR */}
        {nomeCamisa && (
          <div className="flex items-start">
            <span className="text-xs text-on-surface/40 w-16 font-medium">Nome:</span>
            <span className="text-base text-on-surface font-medium">{nomeCamisa}</span>
          </div>
        )}

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
          <SkuGaleria sku={sku} onAtualizado={onAtualizado} />
        </div>
      </div>

      {/* MODO EDIÇÃO */}
      {isExpanded && (
        <div className="border-t-2 border-cor-secundaria/30 p-4 bg-cor-fundo">
          <div className="space-y-4">

            <p className="text-sm font-bold text-on-surface/70">EDITAR VARIAÇÃO</p>

            <div className="space-y-4">

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
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { produtosService } from "../../../services/produtosService";
import { variacoesService } from "../../../services/variacoesService";

function normalizarTipo(nome = "") {
  return String(nome).trim().toLowerCase();
}

export default function SkuEditarModal({ sku, onClose, onSaved }) {
  const [preco, setPreco] = useState(Number(sku.preco || 0));
  const [estoque, setEstoque] = useState(Number(sku.quantidade || 0));
  const [encomenda, setEncomenda] = useState(Boolean(sku.encomenda));
  const [loading, setLoading] = useState(false);

  const [tipos, setTipos] = useState([]);
  const [valoresPorTipo, setValoresPorTipo] = useState({});
  const [selecaoPorTipo, setSelecaoPorTipo] = useState({});

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const tiposData = await variacoesService.listarTipos();
        const valoresMap = {};

        await Promise.all(
          (tiposData || []).map(async (tipo) => {
            const valores = await variacoesService.listarValores(tipo.id);
            valoresMap[tipo.id] = valores || [];
          })
        );

        if (!ativo) return;

        setTipos(tiposData || []);
        setValoresPorTipo(valoresMap);

        const inicial = {};
        (sku.variacoes || []).forEach((variacao) => {
          if (variacao?.tipo_id && variacao?.valor_id) {
            inicial[variacao.tipo_id] = String(variacao.valor_id);
          }
        });
        setSelecaoPorTipo(inicial);
      } catch {
        toast.error("Erro ao carregar variações");
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [sku.id]);

  const tiposExibidos = useMemo(() => {
    const idsSelecionados = new Set(
      Object.entries(selecaoPorTipo)
        .filter(([, valorId]) => Boolean(valorId))
        .map(([tipoId]) => Number(tipoId))
    );

    return (tipos || []).filter((tipo) => {
      const nome = normalizarTipo(tipo.nome);
      return idsSelecionados.has(Number(tipo.id)) || nome === "tamanho";
    });
  }, [tipos, selecaoPorTipo]);

  async function salvar() {
    if (preco <= 0) {
      toast.warning("Preço precisa ser maior que zero");
      return;
    }
    if (estoque < 0) {
      toast.warning("Estoque não pode ser negativo");
      return;
    }

    const valoresIds = Object.values(selecaoPorTipo)
      .map((valorId) => Number(valorId))
      .filter((valorId) => Number.isFinite(valorId) && valorId > 0);

    try {
      setLoading(true);
      await produtosService.atualizarSku(sku.id, {
        preco: Number(preco),
        encomenda: encomenda ? 1 : 0,
      });
      await produtosService.atualizarEstoque(sku.id, {
        quantidade: Number(estoque),
      });
      await produtosService.atualizarVariacoesSku(sku.id, valoresIds);

      toast.success("Variação atualizada com sucesso");
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao salvar edição");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-cor-secundaria/30 bg-cor-fundo shadow-2xl">
        <div className="flex items-center justify-between border-b border-cor-secundaria/30 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface/45">
              Editar variação
            </p>
            <h3 className="text-lg font-bold text-on-surface">
              SKU {sku.sku_codigo || `#${sku.id}`}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-cor-secundaria/40 px-3 py-1 text-sm text-on-surface/70 hover:bg-cor-secundaria/10 transition"
          >
            Fechar
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-on-surface/45">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={preco}
                onChange={(event) => setPreco(event.target.value)}
                className="input-number-admin"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-on-surface/45">
                Estoque
              </label>
              <input
                type="number"
                min="0"
                value={estoque}
                onChange={(event) => setEstoque(event.target.value)}
                className="input-number-admin"
              />
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-on-surface/80">
                <input
                  type="checkbox"
                  checked={encomenda}
                  onChange={(event) => setEncomenda(event.target.checked)}
                  className="h-4 w-4 accent-cor-primaria"
                />
                Permitir encomenda
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-cor-secundaria/30 bg-cor-secundaria/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface/45">
              Variações
            </p>

            {tiposExibidos.length === 0 ? (
              <p className="text-sm text-on-surface/60">
                Nenhum tipo de variação disponível para editar.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tiposExibidos.map((tipo) => (
                  <div key={tipo.id}>
                    <label className="mb-1 block text-xs font-medium text-on-surface/45">
                      {tipo.nome}
                    </label>
                    <select
                      value={selecaoPorTipo[tipo.id] || ""}
                      onChange={(event) =>
                        setSelecaoPorTipo((prev) => ({
                          ...prev,
                          [tipo.id]: event.target.value,
                        }))
                      }
                      className="input-number-admin"
                    >
                      <option value="">Não usar</option>
                      {(valoresPorTipo[tipo.id] || []).map((valor) => (
                        <option key={valor.id} value={valor.id}>
                          {valor.valor}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-cor-secundaria/40 px-4 py-2 text-sm font-semibold text-on-surface/70 hover:bg-cor-secundaria/10 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={loading}
              className="rounded-lg bg-cor-primaria px-4 py-2 text-sm font-semibold text-white hover:bg-cor-primaria/90 disabled:opacity-50 transition"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

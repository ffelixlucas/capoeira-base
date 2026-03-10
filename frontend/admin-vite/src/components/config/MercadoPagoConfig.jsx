import React, { useEffect, useState } from "react";
import {
  buscarMercadoPagoOrganizacao,
  atualizarMercadoPagoOrganizacao,
} from "../../services/organizacaoConfigService";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";

export default function MercadoPagoConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const [ambiente, setAmbiente] = useState("producao");
  const [publicKey, setPublicKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [tokenConfigurado, setTokenConfigurado] = useState(false);
  const [removerToken, setRemoverToken] = useState(false);

  useEffect(() => {
    let ativoTela = true;

    async function carregar() {
      try {
        setLoading(true);
        const data = await buscarMercadoPagoOrganizacao();
        if (!ativoTela || !data) return;

        setAtivo(Boolean(data.ativo));
        setAmbiente(data.ambiente === "sandbox" ? "sandbox" : "producao");
        setPublicKey(String(data.public_key || ""));
        setTokenConfigurado(Boolean(data.access_token_configurado));
      } catch (error) {
        logger.error("[MercadoPagoConfig] Erro ao carregar configuracao", error);
        toast.error("Nao foi possivel carregar a configuracao do Mercado Pago.");
      } finally {
        if (ativoTela) setLoading(false);
      }
    }

    carregar();
    return () => {
      ativoTela = false;
    };
  }, []);

  async function handleSalvar(event) {
    event.preventDefault();

    if (publicKey && publicKey.length > 220) {
      toast.error("Public key invalida.");
      return;
    }

    if (accessToken && accessToken.length > 250) {
      toast.error("Access token invalido.");
      return;
    }

    try {
      setSaving(true);

      const atualizado = await atualizarMercadoPagoOrganizacao({
        ativo,
        ambiente,
        public_key: publicKey.trim(),
        access_token: accessToken.trim(),
        remover_access_token: removerToken,
      });

      setTokenConfigurado(Boolean(atualizado?.access_token_configurado));
      setAccessToken("");
      setRemoverToken(false);
      toast.success("Configuracao de pagamento atualizada.");
    } catch (error) {
      logger.error("[MercadoPagoConfig] Erro ao salvar configuracao", error);
      const msg =
        error?.response?.data?.message ||
        "Nao foi possivel salvar a configuracao do Mercado Pago.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-cor-titulo">
          Pagamentos - Mercado Pago
        </h2>
        <p className="text-sm text-cor-texto/70 mt-1">
          Configuracao por organizacao. O access token fica protegido no backend.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-cor-texto/60">Carregando configuracao...</p>
      ) : (
        <form onSubmit={handleSalvar} className="space-y-3">
          <label className="flex items-center gap-2 text-sm text-cor-texto/80">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
            Gateway ativo para esta organizacao
          </label>

          <div>
            <label className="block text-sm text-cor-texto/80 mb-1.5">
              Ambiente
            </label>
            <select
              value={ambiente}
              onChange={(e) => setAmbiente(e.target.value)}
              className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
            >
              <option value="producao">Producao</option>
              <option value="sandbox">Sandbox</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-cor-texto/80 mb-1.5">
              Public key
            </label>
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="APP_USR-..."
              className="w-full max-w-2xl rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
            />
          </div>

          <div>
            <label className="block text-sm text-cor-texto/80 mb-1.5">
              Access token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={tokenConfigurado ? "Token ja configurado (digite para substituir)" : "APP_USR-..."}
              className="w-full max-w-2xl rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
            />
            <p className="mt-1 text-xs text-cor-texto/60">
              {tokenConfigurado
                ? "Access token configurado para esta organizacao."
                : "Access token ainda nao configurado."}
            </p>
          </div>

          {tokenConfigurado && (
            <label className="flex items-center gap-2 text-sm text-red-600">
              <input
                type="checkbox"
                checked={removerToken}
                onChange={(e) => setRemoverToken(e.target.checked)}
              />
              Remover access token salvo
            </label>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-cor-primaria text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cor-primaria/90 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar Mercado Pago"}
          </button>
        </form>
      )}
    </section>
  );
}


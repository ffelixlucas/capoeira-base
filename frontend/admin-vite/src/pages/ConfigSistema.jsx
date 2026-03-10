import React, { useEffect, useMemo, useState } from "react";
import NotificacoesEmail from "../components/config/NotificacoesEmail";
import ConfigCategorias from "../components/config/ConfigCategorias";
import MercadoPagoConfig from "../components/config/MercadoPagoConfig";
import { useCategorias } from "../hooks/useCategorias";
import { useAuth } from "../contexts/AuthContext";
import { buscarContatoOrganizacao, atualizarContatoOrganizacao } from "../services/organizacaoConfigService";
import { toast } from "react-toastify";
import { logger } from "../utils/logger";

function formatarTelefone(valor) {
  const digits = String(valor || "").replace(/\D/g, "").slice(0, 13);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
}

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

export default function ConfigSistema() {
  const { usuario } = useAuth();
  const {
    categorias,
    carregando,

    adicionarCategoria,
    editarCategoria,
    excluirCategoria,

    adicionarGraduacao,
    editarGraduacao,
    excluirGraduacao,
  } = useCategorias();
  const [contatoLoading, setContatoLoading] = useState(true);
  const [contatoSaving, setContatoSaving] = useState(false);
  const [telefoneContato, setTelefoneContato] = useState("");
  const [whatsappContato, setWhatsappContato] = useState("");
  const [emailContato, setEmailContato] = useState("");
  const [enderecoContato, setEnderecoContato] = useState("");
  const [cidadeContato, setCidadeContato] = useState("");
  const [estadoContato, setEstadoContato] = useState("");
  const [paisContato, setPaisContato] = useState("");

  /* -------------------------------------------------------------------------- */
  /* 🔄 Scroll automático até categorias se abrir com #categorias              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (window.location.hash === "#categorias") {
      const alvo = document.getElementById("categorias");
      if (alvo) {
        setTimeout(() => {
          alvo.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);
      }
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarContato() {
      try {
        setContatoLoading(true);
        const data = await buscarContatoOrganizacao();
        if (!ativo) return;
        setTelefoneContato(formatarTelefone(data?.telefone || ""));
        setWhatsappContato(formatarTelefone(data?.whatsapp_contato || data?.telefone || ""));
        setEmailContato(normalizarEmail(data?.email || ""));
        setEnderecoContato(String(data?.endereco || ""));
        setCidadeContato(String(data?.cidade || ""));
        setEstadoContato(String(data?.estado || ""));
        setPaisContato(String(data?.pais || "Brasil"));
      } catch (error) {
        logger.error("[ConfigSistema] Erro ao carregar contato da organização", error);
        toast.error("Nao foi possivel carregar o contato da organização.");
      } finally {
        if (ativo) setContatoLoading(false);
      }
    }

    if (usuario?.roles?.includes("admin")) {
      carregarContato();
    } else {
      setContatoLoading(false);
    }

    return () => {
      ativo = false;
    };
  }, [usuario?.roles]);

  const numeroLimpo = useMemo(
    () => whatsappContato.replace(/\D/g, ""),
    [whatsappContato]
  );
  const telefoneLimpo = useMemo(
    () => telefoneContato.replace(/\D/g, ""),
    [telefoneContato]
  );

  async function salvarContato(event) {
    event.preventDefault();

    if (!telefoneLimpo) {
      toast.error("Informe o telefone de contato.");
      return;
    }

    if (telefoneLimpo.length < 10) {
      toast.error("Numero de telefone invalido.");
      return;
    }

    if (!numeroLimpo) {
      toast.error("Informe o WhatsApp de contato.");
      return;
    }

    if (numeroLimpo.length < 10) {
      toast.error("Numero de WhatsApp invalido.");
      return;
    }

    const emailNormalizado = normalizarEmail(emailContato);
    if (!emailNormalizado) {
      toast.error("Informe o e-mail de contato.");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);
    if (!isValidEmail) {
      toast.error("E-mail de contato invalido.");
      return;
    }

    if (!String(enderecoContato || "").trim()) {
      toast.error("Informe o endereco de contato.");
      return;
    }

    try {
      setContatoSaving(true);
      const atualizado = await atualizarContatoOrganizacao({
        telefone: telefoneLimpo,
        whatsapp_contato: numeroLimpo,
        email: emailNormalizado,
        endereco: enderecoContato.trim(),
        cidade: cidadeContato.trim(),
        estado: estadoContato.trim(),
        pais: (paisContato || "Brasil").trim()
      });
      setTelefoneContato(formatarTelefone(atualizado?.telefone || telefoneLimpo));
      setWhatsappContato(formatarTelefone(atualizado?.whatsapp_contato || numeroLimpo));
      setEmailContato(normalizarEmail(atualizado?.email || emailNormalizado));
      setEnderecoContato(String(atualizado?.endereco || enderecoContato).trim());
      setCidadeContato(String(atualizado?.cidade || cidadeContato).trim());
      setEstadoContato(String(atualizado?.estado || estadoContato).trim());
      setPaisContato(String(atualizado?.pais || paisContato || "Brasil").trim());
      toast.success("Contato publico atualizado com sucesso.");
    } catch (error) {
      logger.error("[ConfigSistema] Erro ao atualizar contato da organização", error);
      const msg = error?.response?.data?.message || "Nao foi possivel salvar o contato.";
      toast.error(msg);
    } finally {
      setContatoSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-cor-titulo">
        ⚙️ Configurações do Sistema
      </h1>

      {usuario?.roles?.includes("admin") && (
        <section className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-cor-titulo">Contato Publico do Site</h2>
            <p className="text-sm text-cor-texto/70 mt-1">
              Esses dados aparecem no site publico (WhatsApp, localizacao e contato).
            </p>
          </div>

          {contatoLoading ? (
            <p className="text-sm text-cor-texto/60">Carregando contato...</p>
          ) : (
            <form onSubmit={salvarContato} className="space-y-3">
              <div>
                <label htmlFor="telefoneContato" className="block text-sm text-cor-texto/80 mb-1.5">
                  Telefone de contato
                </label>
                <input
                  id="telefoneContato"
                  type="text"
                  value={telefoneContato}
                  onChange={(e) => setTelefoneContato(formatarTelefone(e.target.value))}
                  placeholder="(41) 99999-9999"
                  className="w-full max-w-md rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
                />
              </div>

              <div>
                <label htmlFor="whatsappContato" className="block text-sm text-cor-texto/80 mb-1.5">
                  Número de WhatsApp
                </label>
                <input
                  id="whatsappContato"
                  type="text"
                  value={whatsappContato}
                  onChange={(e) => setWhatsappContato(formatarTelefone(e.target.value))}
                  placeholder="(41) 99999-9999"
                  className="w-full max-w-md rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
                />
              </div>

              <div>
                <label htmlFor="emailContato" className="block text-sm text-cor-texto/80 mb-1.5">
                  E-mail de contato
                </label>
                <input
                  id="emailContato"
                  type="email"
                  value={emailContato}
                  onChange={(e) => setEmailContato(e.target.value)}
                  placeholder="contato@suaorganizacao.com.br"
                  className="w-full max-w-md rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
                />
              </div>

              <div>
                <label htmlFor="enderecoContato" className="block text-sm text-cor-texto/80 mb-1.5">
                  Endereco
                </label>
                <input
                  id="enderecoContato"
                  type="text"
                  value={enderecoContato}
                  onChange={(e) => setEnderecoContato(e.target.value)}
                  placeholder="Rua, numero e bairro"
                  className="w-full max-w-2xl rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                <input
                  type="text"
                  value={cidadeContato}
                  onChange={(e) => setCidadeContato(e.target.value)}
                  placeholder="Cidade"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
                />
                <input
                  type="text"
                  value={estadoContato}
                  onChange={(e) => setEstadoContato(e.target.value)}
                  placeholder="Estado"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
                />
                <input
                  type="text"
                  value={paisContato}
                  onChange={(e) => setPaisContato(e.target.value)}
                  placeholder="Pais"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-cor-input text-black"
                />
              </div>

              <button
                type="submit"
                disabled={contatoSaving}
                className="bg-cor-primaria text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cor-primaria/90 disabled:opacity-60"
              >
                {contatoSaving ? "Salvando..." : "Salvar contato"}
              </button>
            </form>
          )}
        </section>
      )}

      {/* Notificações */}
      <NotificacoesEmail
        emailContatoPadrao={emailContato}
        emailUsuarioPadrao={usuario?.email || ""}
      />

      {usuario?.roles?.includes("admin") && <MercadoPagoConfig />}

      {/* Categorias */}
      <div id="categorias">
        <ConfigCategorias
          categorias={categorias}
          carregando={carregando}
          onAddCategoria={adicionarCategoria}
          onEditCategoria={(cat) => editarCategoria(cat.id, cat.nome)}
          onDeleteCategoria={excluirCategoria}
          onAddGraduacao={(categoriaId, nome, ordem) =>
            adicionarGraduacao(categoriaId, nome, ordem)
          }
          onEditGraduacao={(g) => editarGraduacao(g.id, g)}
          onDeleteGraduacao={excluirGraduacao}
        />
      </div>
    </div>
  );
}

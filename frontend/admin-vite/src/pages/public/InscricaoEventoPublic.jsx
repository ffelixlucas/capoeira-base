import { useEffect, useState, Fragment } from "react";
import { useParams, useNavigate, data } from "react-router-dom";
import { buscarEventoPublicoPorId } from "../../services/agendaService";
import { Dialog, Transition } from "@headlessui/react";
import { gerarPagamentoPix } from "../../services/public/inscricaoPublicService";
import { pagarBoleto } from "../../services/public/pagamentoPublicService";

import EventoInfo from "../../components/public/EventoInfo.jsx";
import FormInscricaoPublic from "../../components/public/FormInscricaoPublic.jsx";
import ModalPagamentoPix from "../../components/public/ModalPagamentoPix.jsx";
import PoliticaLGPD from "../../docs/politicaLGPD.jsx";
import { logger } from "../../utils/logger.js";
import ModalPagamentoCartao from "../../components/public/pagamento/ModalPagamentoCartao.jsx";
import ModalPagamentoBoleto from "../../components/public/pagamento/ModalPagamentoBoleto.jsx";
import ModalConfirmacaoPagamento from "../../components/public/ModalConfirmacaoPagamento.jsx";
import AgendaItem from "../../components/agenda/Item.jsx";

import api from "../../services/api";
import { toast } from "react-toastify";
import { CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function InscricaoEventoPublic() {
  const { slug, eventoId } = useParams(); 
  console.log(
    "[DEBUG MONTAGEM COMPONENTE] componente carregado para eventoId:",
    eventoId
  );

  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [modalLGPD, setModalLGPD] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [dadosPagamento, setDadosPagamento] = useState(null);
  const [modalCartao, setModalCartao] = useState(false);
  const [modalBoleto, setModalBoleto] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [encerrado, setEncerrado] = useState(false);

  console.debug("[DEBUG EVENTO COMPLETO]", evento);

  useEffect(() => {
    if (!evento) {
      console.debug("[DEBUG BLOQUEIO] evento ainda não carregado");
      return;
    }

    // ✅ Função robusta para converter datas de forma segura (inclusive MySQL)
    function parseDatetimeAsSaoPaulo(value) {
      if (!value) return null;
      if (value instanceof Date) return value;

      const s = String(value).trim();
      if (!s) return null;

      // se já tem 'T' ou timezone explícito
      if (s.includes("T") || /[zZ]|[+\-]\d{2}:\d{2}$/.test(s)) {
        const d = new Date(s);
        return isNaN(d) ? null : d;
      }

      // formato MySQL "YYYY-MM-DD HH:MM:SS"
      const d = new Date(s.replace(" ", "T") + "-03:00");
      return isNaN(d) ? null : d;
    }

    const dataInicio = parseDatetimeAsSaoPaulo(evento?.data_inicio);
    const dataLimite = parseDatetimeAsSaoPaulo(evento?.inscricoes_ate);
    const agora = new Date();

    console.debug("[DEBUG BLOQUEIO DATAS]", {
      agora: agora.toISOString(),
      inscricoes_ate_raw: evento.inscricoes_ate,
      data_inicio_raw: evento.data_inicio,
      dataLimite: dataLimite ? dataLimite.toISOString() : null,
      dataInicio: dataInicio ? dataInicio.toISOString() : null,
    });

    if (dataLimite && agora > dataLimite) {
      console.warn("[BLOQUEIO ATIVO] Prazo de inscrição encerrado.");
      setEncerrado(true);
    } else if (dataInicio && agora > dataInicio) {
      console.warn("[BLOQUEIO ATIVO] Evento já começou.");
      setEncerrado(true);
    } else {
      console.info("[BLOQUEIO LIVRE] Inscrições abertas.");
    }
  }, [evento]);

  const [form, setForm] = useState({
    nome: "",
    apelido: "",
    data_nascimento: "",
    email: "",
    telefone: "",
    cpf: "",
    responsavel_nome: "",
    responsavel_documento: "",
    responsavel_contato: "",
    responsavel_parentesco: "",
    tamanho_camiseta: "",
    tem_restricoes: false,
    alergias_restricoes: "",
    aceite_lgpd: false,
    autorizacao_imagem: false,
    metodo_pagamento: "",
    categoria_id: "",
    graduacao_id: "",
  });

  const idade = form.data_nascimento
    ? Math.floor(
        (new Date() - new Date(form.data_nascimento)) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  function formatarTelefone(valor) {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  }

  function formatarCPF(valor) {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ""); // só números
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0,
      resto;

    for (let i = 1; i <= 9; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  // Buscar evento

  useEffect(() => {
    console.log("[DEBUG USEEFFECT] executando com slug:", slug, "eventoId:", eventoId);
  
    async function carregarEvento() {
      try {
        const dados = await buscarEventoPublicoPorId(eventoId, slug);
        console.log("[DEBUG EVENTO DO BACKEND]", dados);
        setEvento(dados);
      } catch (err) {
        console.error("[ERRO AO BUSCAR EVENTO PUBLICO]", err);
        logger.error("Erro ao buscar evento público:", err);
  
        // ⚠️ Mostra mensagem visual amigável e volta para listagem
        toast.error("Este evento não existe ou não pertence a esta organização.");
        setTimeout(() => navigate(`/inscrever/${slug}`), 3000);
      } finally {
        setCarregando(false);
      }
    }
  
    carregarEvento();
  }, [slug, eventoId]);
  
  

  async function handleSubmit(e) {
    e.preventDefault();

    if (!evento) {
      toast.error("Evento não encontrado ou indisponível.");
      navigate(`/inscrever/${slug}`);
      return;
    }
    

    // ✅ Validações iniciais
    if (!form.aceite_lgpd || !form.autorizacao_imagem) {
      alert("Você precisa aceitar a LGPD e autorizar o uso de imagem.");
      return;
    }

    if (!validarCPF(form.cpf)) {
      alert("CPF inválido. Verifique e tente novamente.");
      return;
    }

    if (idade !== null && idade < 18) {
      if (
        !form.responsavel_nome ||
        !form.responsavel_documento ||
        !form.responsavel_contato
      ) {
        alert("Preencha todos os dados do responsável.");
        return;
      }

      if (!validarCPF(form.responsavel_documento)) {
        alert("CPF do responsável inválido.");
        return;
      }
    }

    // ✅ Validação backend (evita duplicar inscrição)
    if (!form.id) {
      try {
        const { data } = await api.get("/public/inscricoes/validar", {
          params: { cpf: form.cpf, evento_id: evento?.id },
        });

        if (data.status === "pendente") {
          logger.log("🔄 Inscrição pendente detectada:", data.inscricao);
          setForm({
            ...form,
            id: data.inscricao.id,
            cpf: form.cpf,
            evento_id: evento?.id,
          });
          toast.info("Inscrição pendente encontrada. Continue o pagamento.");
        } else if (data.ok) {
          logger.log("✅ Nenhuma inscrição encontrada, pode criar nova.");
        } else {
          toast.error(data.error || "Não foi possível validar inscrição.");
          return;
        }
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.message ||
          "Erro ao validar inscrição.";
        toast.error(msg);
        return;
      }
    }

    if (form.tem_restricoes && !form.alergias_restricoes) {
      alert("Descreva as restrições médicas.");
      return;
    }

    if (!form.metodo_pagamento) {
      alert("Selecione a forma de pagamento.");
      return;
    }

    setEnviando(true);

    try {
      if (form.metodo_pagamento === "pix") {
        const resultado = await gerarPagamentoPix({
          ...form,
          evento_id: evento?.id,
          valor: evento?.valor,
          forma_pagamento: "pix",
        });

        setForm({ ...form, id: resultado.id });
        setDadosPagamento(resultado);
        setModalCartao(false);
        setModalPagamento(true);
      } else if (form.metodo_pagamento === "cartao") {
        setModalPagamento(false);
        setModalCartao(true);
      } else if (form.metodo_pagamento === "boleto") {
        setModalPagamento(false);
        setModalBoleto(true);
      } else {
        alert("Selecione a forma de pagamento.");
      }
    } catch (err) {
      logger.error("Erro ao salvar inscrição:", err);
      alert("Erro ao gerar pagamento. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (!carregando && !evento) {
    return (
      <div className="text-center text-white py-10">
        <h2 className="text-xl font-semibold mb-3">
          Evento não encontrado ou indisponível.
        </h2>
        <button
          onClick={() => navigate(`/inscrever/${slug}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Voltar à lista de eventos
        </button>
      </div>
    );
  }
  

  if (encerrado) {
    return (
      <div className="text-center text-white py-10">
        <p className="mb-4 text-lg font-semibold">
          As inscrições para este evento foram encerradas.
        </p>
        <button
          onClick={() => navigate("/inscrever")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Ver outros eventos disponíveis
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center text-white">
      <div className="w-full flex justify-center mb-10 px-4">
  <div className="w-full max-w-[350px] rounded-2xl overflow-hidden border border-blue-400/30 
                  bg-gradient-to-b from-blue-950/60 via-blue-900/40 to-blue-950/60 
                  backdrop-blur-md shadow-[0_0_25px_-4px_rgba(59,130,246,0.3)]">

    {/* Cabeçalho neon translúcido */}
    {evento?.inscricoes_ate && (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex items-center justify-center gap-2 py-3 px-4 
                   bg-gradient-to-r from-blue-700/40 via-blue-600/30 to-blue-700/40 
                   border-b border-blue-400/30 text-blue-100 font-semibold text-sm tracking-wide"
      >
        {/* Glow animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-transparent animate-pulse-slow" />

        <CalendarDays
          className="w-5 h-5 text-blue-300 drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]"
          strokeWidth={2}
        />
        <span className="relative z-10">
          INSCRIÇÕES ATÉ{" "}
          <span className="text-blue-50 font-bold drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]">
            {new Date(evento.inscricoes_ate).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </span>
      </motion.div>
    )}

    {/* Card do evento */}
    <div className="bg-white/95 backdrop-blur-md">
      <AgendaItem evento={evento} mostrarBotoes={false} />
    </div>
  </div>
</div>


      <FormInscricaoPublic
        form={form}
        setForm={setForm}
        idade={idade}
        enviando={enviando}
        handleSubmit={handleSubmit}
        setModalLGPD={setModalLGPD}
        formatarTelefone={formatarTelefone}
        formatarCPF={formatarCPF}
        evento={evento}
      />

      {/* Modal LGPD */}
      <Transition appear show={modalLGPD} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setModalLGPD(false)}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
              <Dialog.Panel
                className="
                  w-full sm:max-w-lg 
                  rounded-t-2xl sm:rounded-2xl 
                  bg-white shadow-xl 
                  text-left align-middle 
                  focus:outline-none
                "
              >
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
                  <Dialog.Title className="text-base sm:text-lg font-bold text-black">
                    Política de Privacidade e LGPD
                  </Dialog.Title>
                </div>
                <div
                  className="px-4 sm:px-6 py-4 max-h-[75vh] sm:max-h-[70vh] overflow-y-auto"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <PoliticaLGPD
                    contexto="evento"
                    organization="Grupo Capoeira Brasil"
                    contactEmail=""
                    updatedAt="2025-08-20"
                  />
                </div>
                <div className="px-4 sm:px-6 py-3 border-t flex justify-end">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    onClick={() => setModalLGPD(false)}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      </Transition>

      {modalPagamento && (
        <ModalPagamentoPix
          isOpen={modalPagamento}
          onClose={() => {
            setModalPagamento(false);
            navigate(`/inscrever/${evento.id}`);
          }}
          pagamento={dadosPagamento}
        />
      )}

      <ModalPagamentoCartao
        isOpen={modalCartao}
        onClose={() => {
          setModalCartao(false);
          navigate(`/inscrever/${slug}/${evento?.id}`);
        }}
        evento={evento}
        form={form}
        setDadosPagamento={setDadosPagamento}
        setModalPagamento={setModalPagamento}
        setModalConfirmacao={setModalConfirmacao}
      />

      <ModalPagamentoBoleto
        aberto={modalBoleto}
        onClose={() => setModalBoleto(false)}
        dadosInscricao={{
          ...form,
          evento_id: evento?.id,
          valor: form.valor || evento?.valor,
          forma_pagamento: "boleto",
        }}
        
      />

      <ModalConfirmacaoPagamento
        isOpen={modalConfirmacao}
        onClose={() => setModalConfirmacao(false)}
        dados={dadosPagamento}
      />
    </div>
  );
}

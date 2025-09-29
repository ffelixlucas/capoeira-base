import { useEffect, useState, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarEventoPublicoPorId } from "../../services/agendaService";
import { Dialog, Transition } from "@headlessui/react";
import { gerarPagamentoPix } from "../../services/public/inscricaoPublicService";

import EventoInfo from "../../components/public/EventoInfo.jsx";
import FormInscricaoPublic from "../../components/public/FormInscricaoPublic.jsx";
import ModalPagamentoPix from "../../components/public/ModalPagamentoPix.jsx";
import PoliticaLGPD from "../../docs/politicaLGPD.jsx";
import { logger } from "../../utils/logger.js";
import ModalPagamentoCartao from "../../components/public/pagamento/ModalPagamentoCartao.jsx";
import ModalConfirmacaoPagamento from "../../components/public/ModalConfirmacaoPagamento.jsx";
import AgendaItem from "../../components/agenda/Item.jsx";

import api from "../../services/api";
import { toast } from "react-toastify";

export default function InscricaoEventoPublic() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [modalLGPD, setModalLGPD] = useState(false);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [dadosPagamento, setDadosPagamento] = useState(null);
  const [modalCartao, setModalCartao] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);

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
    async function carregarEvento() {
      try {
        const dados = await buscarEventoPublicoPorId(eventoId);
        setEvento(dados);
      } catch (err) {
        logger.error("Erro ao buscar evento público:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregarEvento();
  }, [eventoId]);

  async function handleSubmit(e) {
    e.preventDefault();

    // Validações principais
    if (!form.aceite_lgpd || !form.autorizacao_imagem) {
      alert("Você precisa aceitar a LGPD e autorizar o uso de imagem.");
      return;
    }

    // Validar CPF do inscrito
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

      // Validar CPF do responsável
      if (!validarCPF(form.responsavel_documento)) {
        alert("CPF do responsável inválido.");
        return;
      }
    }

    // 🔍 Só valida no backend se ainda não existe inscrição criada
    // 🔍 Só valida no backend se ainda não existe inscrição criada
    if (!form.id) {
      try {
        const { data } = await api.get("/public/inscricoes/validar", {
          params: { cpf: form.cpf, evento_id: evento.id },
        });

        if (data.status === "pendente") {
          logger.log("🔄 Inscrição pendente detectada:", data.inscricao);
          setForm({
            ...form,
            id: data.inscricao.id,
            cpf: form.cpf, // mantém o CPF correto
            evento_id: evento.id, // garante que o evento_id vai junto
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

    // Se marcou restrições, precisa preencher
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
          evento_id: evento.id,
          valor: evento.valor,
          forma_pagamento: "pix",
        });
        setForm({ ...form, id: resultado.id });
        setDadosPagamento(resultado);

        setModalCartao(false); // ✅ fecha Cartão antes
        setModalPagamento(true); // abre Pix
      } else if (form.metodo_pagamento === "cartao") {
        setModalPagamento(false); // ✅ fecha Pix antes
        setModalCartao(true); // abre Cartão
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

  if (carregando) {
    return <p className="text-center text-white/80">Carregando evento...</p>;
  }

  if (!evento) {
    return (
      <div className="text-center text-white">
        <p className="mb-4">
          Evento não encontrado ou não disponível para inscrição.
        </p>
        <button
          onClick={() => navigate(`/inscrever/${evento.id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Voltar para inscrições
        </button>
      </div>
    );
  }

  // ⛔ Bloquear se o evento já passou
  const dataHoje = new Date();
  const dataEvento = new Date(evento.data_inicio);
  // const dataLimite = new Date(evento.inscricao_ate); // (quando existir no backend)

  if (dataEvento < dataHoje) {
    return (
      <div className="text-center text-white">
        <p className="mb-4">
          As inscrições para este evento já estão encerradas.
        </p>
        <button
          onClick={() => navigate(`/inscrever/${evento.id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Ver outros eventos
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center text-white">
      <div className="w-full px-4 mb-6">
        <div className="max-w-[350px] w-full mx-auto">
          <AgendaItem evento={evento} mostrarBotoes={false} />
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
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

          {/* container COM SCROLL (mobile-first) */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
              {/* painel */}
              <Dialog.Panel
                className="
            w-full sm:max-w-lg 
            rounded-t-2xl sm:rounded-2xl 
            bg-white shadow-xl 
            text-left align-middle 
            focus:outline-none
          "
              >
                {/* header fixo */}
                <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
                  <Dialog.Title className="text-base sm:text-lg font-bold text-black">
                    Política de Privacidade e LGPD
                  </Dialog.Title>
                </div>

                {/* CONTEÚDO ROLÁVEL */}
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

                {/* footer fixo */}
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
          navigate(`/inscrever/${evento.id}`);
        }}
        evento={evento}
        form={form}
        setDadosPagamento={setDadosPagamento}
        setModalPagamento={setModalPagamento}
        setModalConfirmacao={setModalConfirmacao}
      />
      <ModalConfirmacaoPagamento
        isOpen={modalConfirmacao}
        onClose={() => setModalConfirmacao(false)}
        dados={dadosPagamento}
      />
    </div>
  );
}

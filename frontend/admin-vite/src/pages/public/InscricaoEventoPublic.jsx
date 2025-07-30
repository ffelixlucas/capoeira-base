import { useEffect, useState, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarEventoPublicoPorId } from "../../services/agendaService";
import { Dialog, Transition } from "@headlessui/react";
import EventoInfo from "../../components/public/EventoInfo.jsx";
import FormInscricaoPublic from "../../components/public/FormInscricaoPublic.jsx";

export default function InscricaoEventoPublic() {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [modalLGPD, setModalLGPD] = useState(false);

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
    tem_restricoes: false, // 👈 NOVO CHECK
    alergias_restricoes: "",
    aceite_lgpd: false,
    autorizacao_imagem: false,
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

  // Buscar evento
  useEffect(() => {
    async function carregarEvento() {
      try {
        const dados = await buscarEventoPublicoPorId(eventoId);
        setEvento(dados);
      } catch (err) {
        console.error("Erro ao buscar evento público:", err);
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

    if (idade !== null && idade < 18) {
      if (
        !form.responsavel_nome ||
        !form.responsavel_documento ||
        !form.responsavel_contato
      ) {
        alert("Preencha todos os dados do responsável.");
        return;
      }
    }

    // Se marcou restrições, precisa preencher
    if (form.tem_restricoes && !form.alergias_restricoes) {
      alert("Descreva as restrições médicas.");
      return;
    }

    setEnviando(true);
    try {
      console.log("Dados enviados:", form);
      alert("Inscrição realizada com sucesso! (integração pendente)");
      navigate("/inscrever");
    } catch (err) {
      console.error("Erro ao salvar inscrição:", err);
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <p className="text-center text-white/80">Carregando evento...</p>
    );
  }

  if (!evento) {
    return (
      <div className="text-center text-white">
        <p className="mb-4">
          Evento não encontrado ou não disponível para inscrição.
        </p>
        <button
          onClick={() => navigate("/inscrever")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Voltar para inscrições
        </button>
      </div>
    );
  }

  return (
    <div className="w-full text-white">
      <EventoInfo evento={evento} />
      <FormInscricaoPublic
        form={form}
        setForm={setForm}
        idade={idade}
        enviando={enviando}
        handleSubmit={handleSubmit}
        setModalLGPD={setModalLGPD}
        formatarTelefone={formatarTelefone}
        formatarCPF={formatarCPF}
      />

      {/* Modal LGPD */}
      <Transition appear show={modalLGPD} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setModalLGPD(false)}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full">
              <Dialog.Title className="text-lg font-bold text-black mb-4">
                Política de Privacidade e LGPD
              </Dialog.Title>
              <p className="text-sm text-gray-700 mb-4">
                Aqui você pode descrever todos os termos de privacidade, uso de
                dados e LGPD...
              </p>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={() => setModalLGPD(false)}
                >
                  Fechar
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

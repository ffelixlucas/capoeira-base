// components/public/ModalErroPagamento.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XCircle } from "lucide-react";

// 🔹 Mapeamento dos status_detail → mensagens amigáveis
const mensagensDetalhadas = {
  cc_rejected_call_for_authorize:
    "❌ Pagamento recusado. Ligue para o banco e autorize a compra.",
  cc_rejected_insufficient_amount:
    "❌ Pagamento recusado por saldo insuficiente.",
  cc_rejected_bad_filled_security_code:
    "❌ Código de segurança inválido. Verifique os 3 dígitos atrás do cartão.",
  cc_rejected_bad_filled_date:
    "❌ Data de validade incorreta. Verifique o mês/ano do cartão.",
  cc_rejected_bad_filled_other:
    "❌ Dados do cartão inválidos. Verifique as informações digitadas.",
  cc_rejected_other_reason:
    "❌ Pagamento recusado. Verifique com seu banco ou use outro cartão.",
};

function getMensagemErro(dados) {
  if (!dados) return "❌ O pagamento não pôde ser processado.";
  const detalhe = dados?.status_detail;
  if (mensagensDetalhadas[detalhe]) return mensagensDetalhadas[detalhe];
  return (
    dados?.message ||
    "❌ O pagamento não pôde ser processado. Tente novamente mais tarde."
  );
}

export default function ModalErroPagamento({ isOpen, onClose, dados }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white text-black rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <XCircle className="text-red-600 w-12 h-12 mx-auto mb-4" />
            <Dialog.Title className="text-lg font-bold mb-2">
              Pagamento não aprovado
            </Dialog.Title>

            <p className="text-sm text-gray-700 mb-4">
              {getMensagemErro(dados)}
            </p>

            <button
              onClick={onClose}
              className="mt-2 bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Fechar
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}

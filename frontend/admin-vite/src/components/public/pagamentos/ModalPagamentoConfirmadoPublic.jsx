import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function ModalPagamentoConfirmadoPublic({
  isOpen,
  onClose,
  dados,
}) {
  if (!dados) return null;
  console.log("DADOS PAGAMENTO CONFIRMADO:", dados);


  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center">

            {/* Ícone sucesso */}
            <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <Dialog.Title className="text-xl font-bold mb-2">
              Pagamento confirmado 🎉
            </Dialog.Title>

            <p className="text-sm text-gray-600 mb-4">
              Seu pagamento foi aprovado com sucesso.
            </p>

            {dados?.entidade_id && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm mb-4">
                Pedido #{dados.entidade_id}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition"
            >
              Fechar
            </button>

          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}

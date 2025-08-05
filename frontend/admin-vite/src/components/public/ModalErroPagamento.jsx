import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XCircle } from "lucide-react";

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
              O pagamento da inscrição não foi confirmado.
              Isso pode acontecer por:
            </p>

            <ul className="text-sm text-left text-gray-600 list-disc list-inside mb-4">
              <li>Tempo de pagamento expirado</li>
              <li>Erro no aplicativo do banco</li>
              <li>Cancelamento manual</li>
            </ul>

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

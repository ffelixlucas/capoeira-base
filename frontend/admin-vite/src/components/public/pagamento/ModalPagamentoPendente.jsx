// components/public/pagamento/ModalPagamentoPendente.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function ModalPagamentoPendente({ isOpen, onClose, dados }) {
  if (!dados) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        {/* container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-bold text-center text-yellow-600">
              ⏳ Pagamento em Análise
            </Dialog.Title>

            <div className="mt-4 text-gray-700 text-center">
              <p>
                Seu pagamento com cartão foi registrado, mas está em{" "}
                <strong>análise pelo banco</strong>.
              </p>
              <p className="mt-2">
                Isso pode levar alguns minutos ou horas. Você receberá um{" "}
                <strong>e-mail de confirmação</strong> assim que for aprovado.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                onClick={onClose}
              >
                Entendi
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}

// components/public/pagamento/ModalPagamentoCartao.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import CartaoPagamento from "./CartaoPagamento";

export default function ModalPagamentoCartao({
  isOpen,
  onClose,
  evento,
  form,
  setDadosPagamento,
  setModalPagamento,
  setModalConfirmacao,
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        {/* container */}
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
              {/* header */}
              <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
                <Dialog.Title className="text-base sm:text-lg font-bold text-black text-center">
                  Pagamento com Cartão
                </Dialog.Title>
              </div>

              {/* corpo */}
              <div className="px-4 sm:px-6 py-6">
                <CartaoPagamento
                  evento={evento}
                  form={form}
                  setDadosPagamento={setDadosPagamento}
                  onSucesso={(dados) => {
                    setDadosPagamento(dados);
                    setModalPagamento(false); 
                    setModalConfirmacao(true);
                    
                  }}
                />
              </div>

              {/* footer */}
              <div className="px-4 sm:px-6 py-3 border-t flex justify-end">
                <button
                  className="px-4 py-2 bg-blue-600 rounded-lg text-sm"
                  onClick={onClose}
                >
                  Fechar
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

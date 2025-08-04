import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FiCopy } from "react-icons/fi";

export default function ModalPagamentoPix({ isOpen, onClose, pagamento }) {
  if (!pagamento) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white text-black rounded-2xl shadow-xl p-6 max-w-md w-full">
            <Dialog.Title className="text-xl font-bold mb-2 text-center">
              Pagamento via PIX
            </Dialog.Title>
            <p className="text-sm text-gray-700 mb-4 text-center">
              Sua inscrição foi registrada! Finalize o pagamento com o QR Code
              abaixo ou copie o código PIX:
            </p>

            <div className="flex justify-center mb-4">
              <img
                src={`data:image/png;base64,${pagamento.qr_code_base64}`}
                alt="QR Code"
                className="w-52 h-52 border rounded-lg"
              />
            </div>

            <div className="mb-3">
              <p className="text-sm font-medium">Valor:</p>
              <p className="bg-gray-100 px-3 py-2 rounded text-sm font-bold">
                {pagamento.valor
                  ? `R$ ${parseFloat(pagamento.valor)
                      .toFixed(2)
                      .replace(".", ",")}`
                  : "Valor indisponível"}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium mb-1">
                Código PIX (copia e cola):
              </p>
              <div className="relative">
                <textarea
                  readOnly
                  className="w-full bg-gray-100 p-2 text-sm rounded resize-none pr-10"
                  rows={3}
                  value={pagamento.qr_code}
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(pagamento.qr_code)
                  }
                  className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-800"
                  title="Copiar código PIX"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 4h6a2 2 0 012 2v6a2 2 0 01-2 2h-8a2 2 0 01-2-2v-6a2 2 0 012-2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-right mb-4">
              Expira em:{" "}
              {new Date(pagamento.date_of_expiration).toLocaleString("pt-BR")}
            </p>

            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="text-sm text-gray-600 hover:underline"
              >
                Fechar
              </button>

              <button
                onClick={() => window.open(pagamento.ticket_url, "_blank")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Abrir link de pagamento
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CheckCircle } from "lucide-react";


export default function ModalConfirmacaoPagamento({ isOpen, onClose, dados }) {
  if (!dados) return null;

  const { nome, codigo_inscricao, evento } = dados;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white text-black rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <CheckCircle className="text-green-600 w-12 h-12 mx-auto mb-4" />
            <Dialog.Title className="text-lg font-bold mb-2">
              Inscrição confirmada com sucesso!
            </Dialog.Title>

            <p className="text-sm text-gray-700 mb-4">
              Olá <strong>{nome}</strong>, sua inscrição está confirmada.
            </p>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600">Código de inscrição:</p>
              <p className="font-mono bg-gray-100 p-2 rounded text-sm text-blue-700">
                {codigo_inscricao}
              </p>
            </div>

            <div className="text-sm text-gray-600 mb-2">
              <p><strong>Evento:</strong> {evento.titulo}</p>
              <p><strong>Data:</strong> {new Date(evento.data).toLocaleDateString("pt-BR")}</p>
              <p><strong>Local:</strong> {evento.local}</p>
            </div>

            <button
              onClick={onClose}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded text-sm"
            >
              Fechar
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}

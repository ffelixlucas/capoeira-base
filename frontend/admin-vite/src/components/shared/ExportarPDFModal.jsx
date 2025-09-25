import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaFilePdf } from "react-icons/fa";

/**
 * Componente reutilizável de modal para exportação em PDF
 * 
 * Props:
 * - onExportLista: função chamada para exportar lista simples
 * - onExportRelatorio: função chamada para exportar relatório completo
 */
export default function ExportarPDFModal({ onExportLista, onExportRelatorio }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      {/* Botão principal */}
      <button
        onClick={() => setAberto(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 text-sm"
      >
        <FaFilePdf /> Exportar PDF
      </button>

      {/* Modal de escolha */}
      <Transition appear show={aberto} as={Fragment}>
        <Dialog as="div" className="relative z-[999]" onClose={() => setAberto(false)}>
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          {/* Conteúdo */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-bold text-center mb-4">
                    Escolher exportação
                  </Dialog.Title>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setAberto(false);
                        onExportLista?.();
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      📋 Lista de inscritos
                    </button>
                    <button
                      onClick={() => {
                        setAberto(false);
                        onExportRelatorio?.();
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                      📊 Relatório completo
                    </button>
                    <button
                      onClick={() => setAberto(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

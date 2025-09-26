import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FileText, FileSpreadsheet, X } from "lucide-react";

export default function ExportarPDFModal({ onExportLista, onExportRelatorio }) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      {/* Botão principal */}
      <button onClick={() => setAberto(true)} className="btn-danger">
        <FileText className="w-4 h-4" /> Exportar PDF
      </button>

      {/* Modal */}
      <Transition appear show={aberto} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[999]"
          onClose={() => setAberto(false)}
        >
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
                  
                  {/* Título */}
                  <Dialog.Title className="text-lg font-bold text-center mb-6 text-black">
                    Escolher exportação
                  </Dialog.Title>

                  {/* Botões */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setAberto(false);
                        onExportLista?.();
                      }}
                      className="btn-info justify-start"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Lista de inscritos</span>
                    </button>

                    <button
                      onClick={() => {
                        setAberto(false);
                        onExportRelatorio?.();
                      }}
                      className="btn-success justify-start"
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                      <span>Relatório completo</span>
                    </button>

                    <button
                      onClick={() => setAberto(false)}
                      className="btn-light justify-start"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancelar</span>
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

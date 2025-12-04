// src/components/ui/ModalFicha.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function ModalFicha({
  aberto,
  onClose,
  titulo,
  subtitulo,
  dados = [],
  onEditar,
  children,
  conteudoZoom,
  zoomAtivo = false,
  onCloseZoom,
}) {
  return (
    <>
      {/* ---------------------- */}
      {/* MODAL PRINCIPAL        */}
      {/* ---------------------- */}
      <Transition appear show={aberto} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
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

          <div className="fixed inset-0 overflow-y-auto text-left">
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
                <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
                  {/* Título */}
                  <Dialog.Title className="text-center text-lg font-bold mb-1 text-black">
                    {titulo}
                  </Dialog.Title>

                  {/* Subtítulo */}
                  {subtitulo && (
                    <div className="text-sm text-center text-gray-600 mb-3">
                      {subtitulo}
                    </div>
                  )}

                  {/* Dados */}
                  <div className="space-y-2 text-sm text-black">
                    {Array.isArray(dados) && dados.length > 0
                      ? dados.map((item, idx) => (
                          <div key={idx}>
                            <strong>{item.label}:</strong> {item.valor || "-"}
                          </div>
                        ))
                      : null}
                  </div>

                  {/* Conteúdo adicional */}
                  {children}

                  {/* Botões */}
                  <div className="mt-6 flex justify-end gap-2">
                    {onEditar && (
                      <button
                        onClick={() => {
                          onEditar();
                          onClose();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* ---------------------- */}
      {/* MODAL DE ZOOM          */}
      {/* ---------------------- */}
      {zoomAtivo && (
        <Transition appear show={zoomAtivo} as={Fragment}>
          <Dialog 
            as="div" 
            className="relative z-[100]" 
            onClose={onCloseZoom}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-150"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/90" />
            </Transition.Child>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-90"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-90"
              >
                <Dialog.Panel 
                  className="relative"
                  onClick={onCloseZoom}
                >
                  {conteudoZoom}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  );
}
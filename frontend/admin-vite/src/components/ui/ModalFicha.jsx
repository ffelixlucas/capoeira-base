// src/components/ui/ModalFicha.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

export default function ModalFicha({
  aberto,
  onClose,
  titulo,
  subtitulo,
  dados = [],
  onEditar,
  children,
}) {
  const [zoomAberto, setZoomAberto] = useState(false);

  // procura o item de foto no array de dados
  const foto = dados?.find?.((d) => d.label === "Foto")?.valor;

  return (
    <Transition appear show={aberto} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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

        {/* Conteúdo principal */}
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
                {/* 🔹 Título e subtítulo */}
                <Dialog.Title className="text-center text-lg font-bold mb-1 text-black">
                  {titulo}
                </Dialog.Title>
                {subtitulo && (
                  <p className="text-sm text-center text-gray-600 mb-3">
                    {subtitulo}
                  </p>
                )}

                {/* 🔹 Foto do aluno (com zoom interno) */}
                {foto && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={foto}
                      alt="Foto do aluno"
                      className="h-32 w-32 rounded-full object-cover border-2 border-gray-200 shadow cursor-pointer transition-transform duration-300 hover:scale-105"
                      onClick={() => setZoomAberto(true)}
                    />
                  </div>
                )}

                {/* 🔹 Dados */}
                <div className="space-y-2 text-sm text-black">
                  {Array.isArray(dados) && dados.length > 0
                    ? dados
                        .filter((item) => item.label !== "Foto")
                        .map((item, idx) => (
                          <p key={idx}>
                            <strong>{item.label}:</strong> {item.valor || "-"}
                          </p>
                        ))
                    : children}
                </div>

                {/* 🔹 Botões */}
                <div className="mt-6 flex justify-end gap-2">
                  {onEditar && (
                    <button
                      onClick={() => {
                        onEditar();
                        onClose();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Editar
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                  >
                    Fechar
                  </button>
                </div>

                {/* 🔍 Modal de zoom da imagem */}
                <Transition appear show={zoomAberto} as={Fragment}>
                  <Dialog
                    as="div"
                    className="relative z-[60]"
                    onClose={() => setZoomAberto(false)}
                  >
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-200"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div
                        className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-4"
                        onClick={() => setZoomAberto(false)} // fecha ao clicar fora
                      >
                        <div
                          className="relative"
                          onClick={(e) => e.stopPropagation()} // impede clique na imagem de fechar
                        >
                          {/* ❌ Botão de fechar */}
                          <button
                            onClick={() => setZoomAberto(false)}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-md"
                            title="Fechar"
                          >
                            ×
                          </button>

                          {/* 🖼️ Imagem ampliada */}
                          <img
                            src={foto}
                            alt="Foto ampliada"
                            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-lg border-2 border-white"
                          />
                        </div>
                      </div>
                    </Transition.Child>
                  </Dialog>
                </Transition>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// components/ExportarPDFModal.jsx
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FileText, FileSpreadsheet, X } from "lucide-react";

/**
 * Modal unificado de exportação
 *
 * Agora permite escolher o tipo de lista (Lista / Relatório)
 * e o formato desejado (PDF / Excel).
 *
 * ✅ 100% compatível com versões anteriores:
 *    - Se não forem passadas props de Excel, ele exporta apenas PDF.
 */
export default function ExportarPDFModal({
  onExportListaPDF,
  onExportRelatorioPDF,
  onExportListaExcel,
  onExportRelatorioExcel,
}) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState(null); // "lista" | "relatorio"

  // reset modal ao fechar
  const fechar = () => {
    setAberto(false);
    setTipo(null);
  };

  return (
    <>
      {/* Botão principal */}
      <button onClick={() => setAberto(true)} className="btn-danger">
        <FileText className="w-4 h-4" /> Exportar
      </button>

      {/* Modal */}
      <Transition appear show={aberto} as={Fragment}>
        <Dialog as="div" className="relative z-[999]" onClose={fechar}>
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
                    {tipo
                      ? "Escolher formato de exportação"
                      : "Escolher tipo de relatório"}
                  </Dialog.Title>

                  {/* Etapa 1 – Escolher tipo */}
                  {!tipo && (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setTipo("lista")}
                        className="btn-info justify-start"
                      >
                        <FileText className="w-5 h-5" />
                        <span>Lista de inscritos</span>
                      </button>

                      <button
                        onClick={() => setTipo("relatorio")}
                        className="btn-success justify-start"
                      >
                        <FileSpreadsheet className="w-5 h-5" />
                        <span>Relatório completo</span>
                      </button>

                      <button onClick={fechar} className="btn-light justify-start">
                        <X className="w-5 h-5" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}

                  {/* Etapa 2 – Escolher formato */}
                  {tipo && (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          fechar();
                          if (tipo === "lista") onExportListaPDF?.();
                          else onExportRelatorioPDF?.();
                        }}
                        className="btn-danger justify-start"
                      >
                        <FileText className="w-5 h-5" />
                        <span>Exportar em PDF</span>
                      </button>

                      <button
                        onClick={() => {
                          fechar();
                          if (tipo === "lista") onExportListaExcel?.();
                          else onExportRelatorioExcel?.();
                        }}
                        className="btn-success justify-start"
                      >
                        <FileSpreadsheet className="w-5 h-5" />
                        <span>Exportar em Excel (.xlsx)</span>
                      </button>

                      <button onClick={() => setTipo(null)} className="btn-light justify-start">
                        <X className="w-5 h-5" />
                        <span>Voltar</span>
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

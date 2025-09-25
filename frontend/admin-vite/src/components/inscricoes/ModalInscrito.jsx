import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaFilePdf, FaPrint } from "react-icons/fa";
import ModalEditarInscrito from "./ModalEditarInscrito";
import api from "../../services/api";
import { logger } from "../../utils/logger";

// ✅ helpers centralizados
import { useFichaInscrito } from "../../hooks/useFichaInscrito";
import { baixarFichaPDF, imprimirFicha } from "../../utils/fichaInscritoPDF";
import InscritoFicha from "./InscritoFicha";

export default function ModalInscrito({ aberto, onClose, inscrito, onEditar }) {
  if (!inscrito) return null;

  const [editarAberto, setEditarAberto] = useState(false);
  const { formatarData, formatBool, abrirWhatsApp } = useFichaInscrito();

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

        {/* Conteúdo */}
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-gray-800 shadow-xl transition-all">
                
                {/* Ficha do inscrito */}
                <InscritoFicha
                  inscrito={inscrito}
                  formatarData={formatarData}
                  formatBool={formatBool}
                  abrirWhatsApp={abrirWhatsApp}
                />

                {/* Ações */}
                <div className="mt-6 flex flex-wrap justify-between gap-2">
                  {/* Exportações */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        baixarFichaPDF(inscrito, formatarData, formatBool)
                      }
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
                    >
                      <FaFilePdf /> PDF
                    </button>
                    <button
                      onClick={() => imprimirFicha(inscrito)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm flex items-center gap-2"
                    >
                      <FaPrint /> Imprimir
                    </button>
                  </div>

                  {/* Ações admin */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditarAberto(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const { data } = await api.post(
                            `/public/inscricoes/${inscrito.id}/reenviar-email`
                          );
                          if (data.ok) {
                            alert(`✅ ${data.mensagem}`);
                          } else {
                            alert(
                              `❌ Erro ao reenviar: ${
                                data.error || "Falha desconhecida"
                              }`
                            );
                          }
                        } catch (err) {
                          if (import.meta.env.DEV) {
                            logger.error("❌ Erro no reenvio:", err);
                          }
                          alert("❌ Falha ao reenviar e-mail");
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
                    >
                      Reenviar E-mail
                    </button>

                    {inscrito.status === "pago" && (
                      <button
                        onClick={async () => {
                          if (
                            window.confirm(
                              "⚠️ Tem certeza que deseja EXTORNAR este pagamento? O valor será devolvido ao inscrito."
                            )
                          ) {
                            try {
                              const { data } = await api.post(
                                `/inscricoes/${inscrito.id}/extornar`
                              );
                              if (data.sucesso) {
                                alert("✅ Pagamento extornado com sucesso!");
                                onEditar?.({
                                  ...inscrito,
                                  status: "extornado",
                                  refund_id: data.debug?.refund_id,
                                  refund_valor: data.debug?.refund_valor,
                                });
                                onClose();
                              } else {
                                alert(
                                  `❌ Erro ao estornar: ${
                                    data.erro || "Falha desconhecida"
                                  }`
                                );
                              }
                            } catch (err) {
                              if (import.meta.env.DEV) {
                                logger.error("Erro ao extornar inscrição:", err);
                              }
                              alert("❌ Falha ao estornar inscrição.");
                            }
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                      >
                        💸 Estornar
                      </button>
                    )}

                    <button
                      onClick={onClose}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* Modal edição */}
        <ModalEditarInscrito
          aberto={editarAberto}
          onClose={() => setEditarAberto(false)}
          inscrito={inscrito}
          onSalvo={(dadosAtualizados) => {
            Object.assign(inscrito, dadosAtualizados);
            onEditar?.(dadosAtualizados);
            setEditarAberto(false);
          }}
        />
      </Dialog>
    </Transition>
  );
}

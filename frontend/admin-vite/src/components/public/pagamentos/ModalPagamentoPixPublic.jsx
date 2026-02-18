import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useMonitorarCobranca } from "../../../hooks/public/pagamentos/useMonitorarCobranca";

export default function ModalPagamentoPixPublic({
  isOpen,
  onClose,
  pagamento,
  slug,
  onSucesso,
  onErro,
}) {
  const [mostrarConfirmado, setMostrarConfirmado] = useState(false);
  const [dadosCobranca, setDadosCobranca] = useState(null);



  console.log("PAGAMENTO COMPLETO:", pagamento);

  useMonitorarCobranca(
    slug,
    pagamento?.cobranca_id,
    (data) => {
      console.log("PEDIDO COMPLETO:", data.pedido);

      setDadosCobranca(data);
      setMostrarConfirmado(true);
      if (onSucesso) onSucesso(data);
    },


    (data) => {
      if (onErro) onErro(data);
    }
  );


  if (!pagamento) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white text-black rounded-2xl shadow-xl p-6 max-w-md w-full">

            {mostrarConfirmado ? (
              <div className="text-center space-y-4">
                <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto" />

                <h2 className="text-xl font-bold text-green-700">
                  Pagamento confirmado!
                </h2>

                {/* 🔥 RESUMO DA COMPRA */}
                {dadosCobranca?.pedido && (
                  <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-700 space-y-3 text-left">

                    <p className="font-semibold">
                      Resumo do seu pedido:
                    </p>

                    {dadosCobranca.pedido.itens.map((item) => {
                      const subtotal = Number(item.preco_unitario) * item.quantidade;

                      return (
                        <div key={item.id} className="flex justify-between">
                          <div>
                            {item.quantidade}x {item.nome_produto}
                          </div>
                          <div>
                            R$ {subtotal.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}

                    {/* 🔥 calcular total manualmente */}
                    <div className="border-t pt-2 font-semibold flex justify-between">
                      <span>Total</span>
                      <span>
                        R$ {dadosCobranca.pedido.itens
                          .reduce(
                            (acc, item) =>
                              acc + Number(item.preco_unitario) * item.quantidade,
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>

                  </div>
                )}


                <p className="text-sm text-gray-600">
                  Seu pagamento foi aprovado com sucesso.
                </p>

                <button
                  onClick={onClose}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Fechar
                </button>
              </div>

            ) : (
              <>
                <Dialog.Title className="text-xl font-bold mb-4 text-center">
                  Pagamento via PIX
                </Dialog.Title>

                <div className="flex justify-center mb-4">
                  <img
                    src={`data:image/png;base64,${pagamento.qr_code_base64}`}
                    alt="QR Code"
                    className="w-52 h-52 border rounded-lg"
                  />
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">
                    Código PIX (copia e cola):
                  </p>

                  <textarea
                    readOnly
                    className="w-full bg-gray-100 p-2 text-sm rounded resize-none"
                    rows={3}
                    value={pagamento.qr_code}
                  />
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

                  {pagamento.ticket_url && (
                    <button
                      onClick={() => window.open(pagamento.ticket_url, "_blank")}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Abrir link
                    </button>
                  )}
                </div>
              </>
            )}

          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}

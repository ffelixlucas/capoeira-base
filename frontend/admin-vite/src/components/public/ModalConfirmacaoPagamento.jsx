// components/public/pagamento/ModalConfirmacaoPagamento.jsx
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CheckCircle } from "lucide-react";
import { logger } from "../../utils/logger"; // 🔥 usa nosso logger

export default function ModalConfirmacaoPagamento({ isOpen, onClose, dados }) {
  // Se não houver dados ou não estiver aberto, não renderiza nada
  if (!isOpen || !dados) return null;

  // 🔎 Debug usando logger padronizado
  logger.debug("[ModalConfirmacaoPagamento] dados recebidos:", dados);

  // Fallbacks seguros para evitar undefined
  const {
    status,
    nome = "",
    codigo_inscricao = "",
    metodo_pagamento = "",
    valor_liquido,
    parcelas,
    bandeira_cartao,
    taxa_valor,
    taxa_percentual,
    evento: eventoBruto,
  } = dados;

  // Garante objeto mesmo se vier undefined por um frame
  const evento = eventoBruto || {};
  const tituloEvento = evento?.titulo || "-";
  const dataInicio = evento?.data_inicio
    ? new Date(evento.data_inicio)
    : null;
  const dataFim = evento?.data_fim ? new Date(evento.data_fim) : null;
  const localEvento = evento?.local || "-";

  // Valor pago: prioriza valor_liquido; fallback para valor do evento
  const valorPago = Number(valor_liquido ?? evento?.valor ?? 0);
  const valorPagoFmt = isFinite(valorPago) ? valorPago.toFixed(2) : "0.00";

  // Taxas e parcelas só aparecem no cartão
  const isCartao = metodo_pagamento === "cartao";
  const parcelasFmt = isCartao ? (parcelas || 1) : null;

  // 🔥 Converte taxa sempre para número seguro
  const taxaValorNum = parseFloat(taxa_valor ?? 0);
  const taxaPercNum = parseFloat(taxa_percentual ?? 0);

  // Se por algum motivo vier com status diferente de pago, evita abrir modal
  if (status && status !== "pago") return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
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

            {/* Código */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600">
                Código de inscrição:
              </p>
              <p className="font-mono bg-gray-100 p-2 rounded text-sm text-blue-700">
                {codigo_inscricao}
              </p>
            </div>

            {/* Evento */}
            <div className="text-sm text-gray-600 mb-2">
              <p>
                <strong>Evento:</strong> {tituloEvento}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {dataInicio ? dataInicio.toLocaleDateString("pt-BR") : "-"}
                {dataFim ? ` até ${dataFim.toLocaleDateString("pt-BR")}` : ""}
              </p>
              <p>
                <strong>Local:</strong> {localEvento}
              </p>

              {/* Pagamento */}
              <div className="mt-3 text-left bg-gray-50 p-3 rounded-md">
                <p>
                  <strong>Método:</strong>{" "}
                  {metodo_pagamento === "pix"
                    ? "PIX"
                    : `Cartão ${bandeira_cartao?.toUpperCase?.() || ""}`}
                </p>
                <p>
                  <strong>Valor pago:</strong> R$ {valorPagoFmt}
                </p>

                {isCartao && (
                  <>
                    <p>
                      <strong>Parcelas:</strong> {parcelasFmt}x
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Taxas:</strong> R$ {taxaValorNum.toFixed(2)} (
                      {taxaPercNum.toFixed(2)}%)
                    </p>
                  </>
                )}
              </div>

              {/* Aviso email */}
              <p className="text-xs text-gray-500 mt-3">
                Você receberá um e-mail com todos os detalhes da sua
                inscrição e do evento.
              </p>

              {/* Aviso spam */}
              <div className="mt-4 p-3 rounded-md border border-red-500 bg-yellow-100">
                <p className="text-sm text-red-700 font-bold">
                  ⚠️ Atenção: Se você não encontrar o e-mail na sua caixa de
                  entrada, verifique também a pasta <strong>Spam</strong> ou{" "}
                  <strong>Lixeira</strong>.
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  Caso não encontre, entre em contato com a organização do
                  evento.
                </p>
              </div>
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

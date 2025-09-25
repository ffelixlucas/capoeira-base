import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FaFilePdf,
  FaPrint,
  FaEdit,
  FaEnvelope,
  FaUndo,
  FaTimes,
} from "react-icons/fa";
import ModalEditarInscrito from "./ModalEditarInscrito";
import api from "../../services/api";
import { logger } from "../../utils/logger";
import { toast } from "react-toastify";

// ✅ helpers centralizados
import { useFichaInscrito } from "../../hooks/useFichaInscrito";
import { baixarFichaPDF, imprimirFicha } from "../../utils/fichaInscritoPDF";
import InscritoFicha from "./InscritoFicha";

export default function ModalInscrito({ aberto, onClose, inscrito, onEditar }) {
  if (!inscrito) return null;

  const [editarAberto, setEditarAberto] = useState(false);
  const { formatarData, formatBool, abrirWhatsApp } = useFichaInscrito();

  // 🔹 handlers separados para clareza
  const handleReenviarEmail = async () => {
    try {
      const { data } = await api.post(
        `/public/inscricoes/${inscrito.id}/reenviar-email`
      );
      if (data.ok) {
        toast.success(data.mensagem || "E-mail reenviado com sucesso!");
      } else {
        toast.error(data.error || "Falha ao reenviar e-mail");
      }
    } catch (err) {
      if (import.meta.env.DEV) logger.error("❌ Erro no reenvio:", err);
      toast.error("Falha ao reenviar e-mail");
    }
  };

  const handleExtornar = async () => {
    if (
      window.confirm(
        "⚠️ Tem certeza que deseja EXTORNAR este pagamento? O valor será devolvido ao inscrito."
      )
    ) {
      try {
        const { data } = await api.post(`/inscricoes/${inscrito.id}/extornar`);
        if (data.sucesso) {
          toast.success("Pagamento extornado com sucesso!");
          onEditar?.({
            ...inscrito,
            status: "extornado",
            refund_id: data.debug?.refund_id,
            refund_valor: data.debug?.refund_valor,
          });
          onClose();
        } else {
          toast.error(data.erro || "Falha ao estornar");
        }
      } catch (err) {
        if (import.meta.env.DEV)
          logger.error("Erro ao extornar inscrição:", err);
        toast.error("Erro inesperado ao estornar inscrição");
      }
    }
  };

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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white/90 backdrop-blur-md p-6 text-gray-800 shadow-2xl transition-all">
                {/* Cabeçalho */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {inscrito.apelido || inscrito.nome}
                </h2>
                <p className="text-sm text-gray-500 mb-4">{inscrito.nome}</p>

                {/* Ficha do inscrito */}
                <div className="divide-y divide-gray-100">
                  <InscritoFicha
                    inscrito={inscrito}
                    formatarData={formatarData}
                    formatBool={formatBool}
                    abrirWhatsApp={abrirWhatsApp}
                  />
                </div>

               {/* Footer clean */}
<div className="mt-6 flex flex-wrap justify-between items-center gap-2">
  {/* Exportações */}
  <div className="flex gap-2">
    <button
      onClick={() => baixarFichaPDF(inscrito, formatarData, formatBool)}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition shadow-sm"
      aria-label="Baixar ficha em PDF"
    >
      <FaFilePdf className="text-lg" />
    </button>
    <button
      onClick={() => imprimirFicha(inscrito)}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition shadow-sm"
      aria-label="Imprimir ficha"
    >
      <FaPrint className="text-lg" />
    </button>
  </div>

  {/* Ações admin */}
  <div className="flex flex-wrap gap-2 justify-end">
    <button className="btn-info min-w-[90px] h-9 px-3 text-xs flex items-center justify-center">
      <FaEdit className="mr-1 text-sm" /> Editar
    </button>
    <button
      onClick={handleReenviarEmail}
      className="btn-success min-w-[90px] h-9 px-3 text-xs flex items-center justify-center"
    >
      <FaEnvelope className="mr-1 text-sm" /> Reenviar
    </button>
    {inscrito.status === "pago" && (
      <button
        onClick={handleExtornar}
        className="btn-danger min-w-[90px] h-9 px-3 text-xs flex items-center justify-center"
      >
        <FaUndo className="mr-1 text-sm" /> Estornar
      </button>
    )}
    <button
      onClick={onClose}
      className="border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg min-w-[90px] h-9 px-3 text-xs flex items-center justify-center"
    >
      <FaTimes className="mr-1 text-sm" /> Fechar
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

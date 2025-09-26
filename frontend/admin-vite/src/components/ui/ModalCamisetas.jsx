import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FaClipboard, FaTimes } from "react-icons/fa";

export default function ModalCamisetas({ aberto, onClose, resumo = [] }) {
  const pagos = resumo.filter((item) => item.status === "pago" || !item.status);
  const total = pagos.reduce((acc, item) => acc + (item.total || 0), 0);

  function copiarResumo() {
    const texto = pagos
      .map((item) => `${item.tamanho || "Não informado"}: ${item.total}`)
      .join("\n");
    const final = `👕 Camisetas (${total} no total)\n${texto}`;
    navigator.clipboard.writeText(final);
    alert("✅ Resumo copiado para área de transferência!");
  }

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
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
              {/* Título */}
              <Dialog.Title className="text-center text-lg font-bold text-gray-900 mb-4">
                👕 Camisetas por tamanho (pagos)
              </Dialog.Title>

              {/* Grid de tamanhos */}
              <ul className="grid grid-cols-2 gap-3">
                {pagos.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex flex-col items-center justify-center border rounded-lg py-3 bg-gray-50 shadow-sm"
                  >
                    <span className="text-base font-bold text-gray-800">
                      {item.tamanho || "?"}
                    </span>
                    <span className="text-lg font-semibold text-blue-600">
                      {item.total}
                    </span>
                  </li>
                ))}

                {/* total */}
                <li className="col-span-2 flex flex-col items-center justify-center border rounded-lg py-3 bg-white shadow">
                  <span className="text-sm font-semibold text-gray-700">Total</span>
                  <span className="text-xl font-bold text-green-600">{total}</span>
                </li>
              </ul>

              {/* Footer */}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={copiarResumo}
                  className="btn-info flex items-center gap-1"
                >
                  <FaClipboard /> Copiar resumo
                </button>
                <button
                  onClick={onClose}
                  className="btn-light flex items-center gap-1"
                >
                  <FaTimes /> Fechar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
    
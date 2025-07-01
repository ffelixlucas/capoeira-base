import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import { useLembretes } from "../../hooks/useLembretes";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import LembreteLista from "./LembreteLista";
import LembreteForm from "./LembreteForm";
import { usePermissao } from "../../hooks/usePermissao";

export default function ModalLembretes({ aberto, aoFechar }) {
  const { lembretes, loading, adicionar, editar, remover } = useLembretes();
  const { temPapel } = usePermissao();
  const [modoForm, setModoForm] = useState(null);

  useEffect(() => {
    if (!aberto) setModoForm(null);
  }, [aberto]);

  return (
    <Dialog
      open={aberto}
      onClose={aoFechar}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center bg-black/30 flex items-center justify-center">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white text-cor-escura p-6 shadow-xl text-left border border-cor-secundaria/40">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold text-cor-escura">
              Lembretes
            </Dialog.Title>
            <button
              onClick={aoFechar}
              className="text-gray-400 hover:text-red-400"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {modoForm ? (
            <LembreteForm
              dadosIniciais={modoForm !== "novo" ? modoForm : {}}
              onCancelar={() => setModoForm(null)}
              onSalvar={async (dados) => {
                if (modoForm === "novo") await adicionar(dados);
                else await editar(modoForm.id, dados);
                setModoForm(null);
              }}
            />
          ) : (
            <>
              {loading ? (
                <p className="text-sm text-cor-escura/80">
                  Carregando lembretes...
                </p>
              ) : (
                <LembreteLista
                  lembretes={lembretes}
                  onEditar={editar}
                  onExcluir={remover}
                />
              )}

              {temPapel(["admin", "instrutor"]) && (
                <button
                  onClick={() => setModoForm("novo")}
                  className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition"
                >
                  <PlusIcon className="inline-block h-4 w-4 mr-1" />
                  Novo Lembrete
                </button>
              )}
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

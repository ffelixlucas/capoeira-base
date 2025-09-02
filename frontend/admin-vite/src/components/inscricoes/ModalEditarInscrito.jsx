import { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { atualizarInscrito } from "../../services/inscricaoService";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";

export default function ModalEditarInscrito({ aberto, onClose, inscrito, onSalvo }) {
  const [form, setForm] = useState({
    nome: inscrito?.nome || "",
    apelido: inscrito?.apelido || "",
    telefone: inscrito?.telefone || "",
    email: inscrito?.email || "",
    cpf: inscrito?.cpf || "",
    responsavel_nome: inscrito?.responsavel_nome || "",
    responsavel_contato: inscrito?.responsavel_contato || "",
    responsavel_parentesco: inscrito?.responsavel_parentesco || "",
    tamanho_camiseta: inscrito?.tamanho_camiseta || "",
    alergias_restricoes: inscrito?.alergias_restricoes || ""
  });

  const [salvando, setSalvando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      const atualizado = await atualizarInscrito(inscrito.id, form);
      toast.success("Inscrição atualizada com sucesso!");
      onSalvo(atualizado);
    } catch (error) {
      logger.error(error);
      toast.error("Erro ao atualizar inscrição!");
    } finally {
      setSalvando(false);
    }
  }

  const inputBase =
    "w-full border rounded-lg px-3 py-2 text-black text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <Transition appear show={aberto} as={Fragment}>
      <Dialog as="div" className="relative z-[999]" onClose={onClose}>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Conteúdo */}
        <div className="fixed inset-0 overflow-y-auto px-4">
          <div className="flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                <Dialog.Title className="text-lg font-bold text-black text-center mb-4">
                  Editar Inscrição
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Nome */}
                  <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Nome completo"
                    className={inputBase}
                    required
                  />
                  {/* Apelido */}
                  <input
                    type="text"
                    name="apelido"
                    value={form.apelido}
                    onChange={handleChange}
                    placeholder="Apelido"
                    className={inputBase}
                  />
                  {/* Telefone */}
                  <input
                    type="tel"
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    placeholder="Telefone (WhatsApp)"
                    className={inputBase}
                  />
                  {/* Email */}
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className={inputBase}
                  />
                  {/* CPF */}
                  <input
                    type="text"
                    name="cpf"
                    value={form.cpf}
                    onChange={handleChange}
                    placeholder="CPF"
                    className={inputBase}
                  />

                  {/* Dados do responsável */}
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Responsável (se menor de idade)
                    </p>
                    <input
                      type="text"
                      name="responsavel_nome"
                      value={form.responsavel_nome}
                      onChange={handleChange}
                      placeholder="Nome do responsável"
                      className={inputBase}
                    />
                    <input
                      type="tel"
                      name="responsavel_contato"
                      value={form.responsavel_contato}
                      onChange={handleChange}
                      placeholder="Telefone do responsável"
                      className={inputBase}
                    />
                    <input
                      type="text"
                      name="responsavel_parentesco"
                      value={form.responsavel_parentesco}
                      onChange={handleChange}
                      placeholder="Parentesco"
                      className={inputBase}
                    />
                  </div>

                  {/* Outros campos */}
                  <select
                    name="tamanho_camiseta"
                    value={form.tamanho_camiseta}
                    onChange={handleChange}
                    className={inputBase}
                  >
                    <option value="">Tamanho da camiseta</option>
                    <option value="P">P</option>
                    <option value="M">M</option>
                    <option value="G">G</option>
                    <option value="GG">GG</option>
                  </select>

                  <textarea
                    name="alergias_restricoes"
                    value={form.alergias_restricoes}
                    onChange={handleChange}
                    placeholder="Alergias ou restrições"
                    className={inputBase}
                    rows={2}
                  ></textarea>

                  {/* Botões */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 text-black rounded-lg text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={salvando}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-60"
                    >
                      {salvando ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

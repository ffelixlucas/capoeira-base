import React, { useState, useEffect } from "react";
import {
  criarMembro,
  atualizarMembro,
  listarRoles,
  atribuirPapel,
  removerTodosOsPapeis,
} from "../../services/equipeService";
import InputBase from "../ui/InputBase";
import InputSenha from "../ui/InputSenha";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";

/**
 * 🧱 Modal de criação/edição de membro da equipe
 * Padrão Capoeira Base v2 (mobile-first + clean code)
 */
export default function EquipeForm({ onClose, membroSelecionado, onSave }) {
  const editando = Boolean(membroSelecionado);

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    whatsapp: "",
    email: "",
    senha: "",
    status: "ativo",
    observacoes: "",
    role_ids: [],
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarDescricao, setMostrarDescricao] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* 🔄 Carregar roles                                                          */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    async function fetchRoles() {
      try {
        const data = await listarRoles();
        setRoles(data);
        logger.debug("[EquipeForm] Roles carregadas", { total: data.length });
      } catch (err) {
        toast.error("Erro ao carregar papéis");
        logger.error("[EquipeForm] Erro ao carregar roles", { erro: err.message });
      }
    }
    fetchRoles();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Preencher form ao editar                                                */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (membroSelecionado) {
      setForm({
        nome: membroSelecionado.nome || "",
        telefone: membroSelecionado.telefone || "",
        whatsapp: membroSelecionado.whatsapp || "",
        email: membroSelecionado.email || "",
        senha: "",
        status: membroSelecionado.status || "ativo",
        observacoes: membroSelecionado.observacoes || "",
        role_ids: membroSelecionado.roles?.map((r) => r.id) || [],
      });
    }
  }, [membroSelecionado]);

  /* -------------------------------------------------------------------------- */
  /* ⚙️ Handlers                                                              */
  /* -------------------------------------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleRole = (id) => {
    setForm((prev) => ({
      ...prev,
      role_ids: prev.role_ids.includes(id)
        ? prev.role_ids.filter((r) => r !== id)
        : [...prev.role_ids, id],
    }));
  };

  /* -------------------------------------------------------------------------- */
  /* 💾 Salvar membro                                                          */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      toast.warning("Nome é obrigatório");
      return;
    }

    setLoading(true);
    try {
      let membroId;

      if (editando) {
        // atualização
        const dados = {
          nome: form.nome,
          telefone: form.telefone,
          whatsapp: form.whatsapp,
          email: form.email,
          status: form.status,
          observacoes: form.observacoes,
        };
        if (form.senha.trim()) dados.senha = form.senha;

        await atualizarMembro(membroSelecionado.id, dados);
        membroId = membroSelecionado.id;

        logger.debug("[EquipeForm] Membro atualizado", { id: membroId });
      } else {
        // criação
        const criado = await criarMembro(form);
        membroId = criado?.id?.id || criado?.id;

        if (!membroId) throw new Error("ID inválido retornado do backend");
        logger.debug("[EquipeForm] Novo membro criado", { id: membroId });
      }

      // atualizar papéis
      if (Array.isArray(form.role_ids)) {
        if (editando) {
          await removerTodosOsPapeis(membroId).catch((err) =>
            logger.warn("[EquipeForm] Erro ao remover papéis antigos", err.message)
          );
        }

        for (const roleId of form.role_ids) {
          await atribuirPapel(membroId, roleId).catch((err) =>
            logger.error("[EquipeForm] Erro ao atribuir papel", { roleId, erro: err.message })
          );
        }
      }

      toast.success("Membro salvo com sucesso!");
      logger.debug("[EquipeForm] Membro salvo com sucesso", { id: membroId });

      onSave?.();
      onClose?.();
    } catch (err) {
      toast.error("Erro ao salvar membro");
      logger.error("[EquipeForm] Falha ao salvar membro", { erro: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🧱 Render                                                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-cor-secundaria text-cor-texto rounded-xl shadow-lg p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-cor-titulo">
          {editando ? "Editar Membro" : "Novo Membro"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <InputBase
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <InputBase
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                placeholder="(41) 99999-9999"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <InputBase
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="(41) 99999-9999"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <InputBase
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
            />
          </div>

          {!editando && (
            <div>
              <label className="block text-sm font-medium mb-1">Senha *</label>
              <InputSenha
                placeholder="Defina uma senha"
                value={form.senha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, senha: e.target.value }))
                }
              />
            </div>
          )}

          {/* PAPÉIS */}
          <div>
            <div className="flex items-center gap-2">
              <label className="block font-medium">Papéis *</label>
              <button
                type="button"
                onClick={() => setMostrarDescricao(!mostrarDescricao)}
                className="text-blue-500 text-xl font-bold"
              >
                ?
              </button>
            </div>

            {mostrarDescricao && (
              <div className="bg-white text-gray-800 p-2 rounded text-sm mt-2 shadow">
                ✅ admin: Acesso total a todas as áreas.<br />
                ✅ instrutor: Gerencia horários e eventos.<br />
                ✅ midia: Gerencia galeria e eventos.<br />
                ✅ loja: Gerencia produtos e pedidos.<br />
                <br />
                <strong>Um membro pode ter mais de um papel.</strong>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              {Array.isArray(roles) &&
                roles.map((role) => {
                  const ativo = form.role_ids.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`px-3 py-1 rounded-full border text-sm transition ${
                        ativo
                          ? "bg-cor-primaria text-cor-escura border-cor-primaria"
                          : "bg-cor-secundaria text-cor-texto border-cor-clara hover:border-cor-primaria"
                      }`}
                    >
                      {role.nome}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="ferias">Férias</option>
            </select>
          </div>

          {/* OBSERVAÇÕES */}
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
              placeholder="Anotações internas (opcional)"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-cor-primaria text-cor-escura hover:bg-cor-primaria/90"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

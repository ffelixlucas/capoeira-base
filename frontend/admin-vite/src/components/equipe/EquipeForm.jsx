import React, { useState, useEffect } from "react";
import {
  criarMembro,
  listarRoles,
  atribuirPapel,
  atualizarMembro,
  removerTodosOsPapeis,
} from "../../services/equipeService";
import { toast } from "react-toastify";

function EquipeForm({
  onClose,
  membroSelecionado,
  usuarioLogado,
  onSave,}) {
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

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await listarRoles();
        setRoles(res.data);
      } catch (err) {
        toast.error("Erro ao carregar papéis");
      }
    }
    fetchRoles();
  }, []);

  useEffect(() => {
    if (membroSelecionado) {
      setForm({
        nome: membroSelecionado.nome || "",
        telefone: membroSelecionado.telefone || "",
        whatsapp: membroSelecionado.whatsapp || "",
        email: membroSelecionado.email || "",
        senha: "", // nunca preencher senha por segurança
        status: membroSelecionado.status || "ativo",
        observacoes: membroSelecionado.observacoes || "",
        role_ids: membroSelecionado.roles?.map((r) => r.id) || [],
      });
    }
  }, [membroSelecionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const toggleRole = (id) => {
    setForm((prev) => {
      const jaTem = prev.role_ids.includes(id);
      return {
        ...prev,
        role_ids: jaTem
          ? prev.role_ids.filter((rid) => rid !== id)
          : [...prev.role_ids, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      toast.warning("Nome é obrigatório");
      return;
    }

    setLoading(true);

    try {
      let membroId;

      // Atualizar membro
      if (membroSelecionado) {
        const dados = {
          nome: form.nome,
          telefone: form.telefone,
          whatsapp: form.whatsapp,
          email: form.email,
          status: form.status,
          observacoes: form.observacoes,
        };
        if (form.senha.trim()) {
          dados.senha = form.senha;
        }

        await atualizarMembro(membroSelecionado.id, dados);
        membroId = membroSelecionado.id;
      } else {
        const res = await criarMembro(form);
        membroId = res.data.insertId || res.data.id;
      }

      // Só mexe nos papéis se houver pelo menos 1 selecionado
      if (form.role_ids && form.role_ids.length > 0) {
        await removerTodosOsPapeis(membroId);
        for (let roleId of form.role_ids) {
          await atribuirPapel(membroId, roleId); // ← lembrando que precisa estar com `{ roleId }`
        }
      }

      toast.success("Membro salvo com sucesso!");
      if (onSave) onSave();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar membro");
    } finally {
      setLoading(false);
    }
  };

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
          {membroSelecionado ? "Editar Membro" : "Novo Membro"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-medium">Nome *</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full border border-cor-clara rounded px-3 py-2 bg-transparent text-cor-texto"
              required
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block font-medium">Telefone</label>
              <input
                type="text"
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                className="w-full border border-cor-clara rounded px-3 py-2 bg-transparent text-cor-texto"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium">WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                className="w-full border border-cor-clara rounded px-3 py-2 bg-transparent text-cor-texto"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium">Email (login)</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-cor-clara rounded px-3 py-2 bg-transparent text-cor-texto"
            />
          </div>

          {(!membroSelecionado || usuarioLogado?.roles?.includes("admin")) && (
            <div>
              <label className="block font-medium">
                Senha {membroSelecionado ? "(nova senha opcional)" : "*"}
              </label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full border border-cor-clara rounded px-3 py-2 bg-transparent text-cor-texto"
              />
            </div>
          )}

          <div>
            <label className="block font-medium">Papéis *</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {roles.map((role) => {
                const ativo = form.role_ids.includes(role.id);
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={`px-3 py-1 rounded-full border transition text-sm ${
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

          <div>
            <label className="block font-medium">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-cor-clara rounded px-3 py-2 bg-cor-secundaria text-cor-texto"
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="ferias">Férias</option>
            </select>
          </div>

          <div>
            <label className="block font-medium">Observações</label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              className="w-full border border-cor-clara rounded px-3 py-2 bg-transparent text-cor-texto"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
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

export default EquipeForm;

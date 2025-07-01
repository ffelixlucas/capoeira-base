import { useState } from "react";

export default function LembreteForm({
  dadosIniciais = {},
  onCancelar,
  onSalvar,
}) {
  const [form, setForm] = useState({
    titulo: dadosIniciais.titulo || "",
    descricao: dadosIniciais.descricao || "",
    prioridade: dadosIniciais.prioridade || "baixa",
    status: dadosIniciais.status || "pendente",
    data: dadosIniciais.data ? dadosIniciais.data.split("T")[0] : "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.titulo.trim()) return alert("Título é obrigatório");
    onSalvar(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-cor-escura">
      <div>
        <label className="block text-sm font-semibold mb-1">Título *</label>
        <input
          type="text"
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          className="w-full border border-cor-clara bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Descrição</label>
        <textarea
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          rows="3"
          className="w-full border border-cor-clara bg-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cor-primaria"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Data</label>
          <input
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
            className="w-full border border-cor-clara bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-semibold mb-1">Prioridade</label>
          <select
            name="prioridade"
            value={form.prioridade}
            onChange={handleChange}
            className="w-full border border-cor-clara bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cor-primaria"
          >
            <option value="baixa">Sem prioridade</option>
            <option value="media">Amarela</option>
            <option value="alta">Vermelha</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancelar}
          className="text-sm text-gray-500 hover:underline"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}

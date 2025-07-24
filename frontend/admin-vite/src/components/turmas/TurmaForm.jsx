import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { criarTurma, atualizarTurma } from "../../services/turmaService";
import { useEquipe } from "../../hooks/useEquipe";

export default function TurmaForm({ onCriado, turmaEditando = null }) {
  const { membros, loading: carregandoEquipe, carregarEquipe } = useEquipe();

  const [form, setForm] = useState({
    nome: "",
    faixa_etaria: "",
    equipe_id: "",
  });

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarEquipe();
  }, []);

  // Preenche campos se estiver em modo edição
  useEffect(() => {
    if (turmaEditando) {
      setForm({
        nome: turmaEditando.nome || "",
        faixa_etaria: turmaEditando.faixa_etaria || "",
        equipe_id: turmaEditando.equipe_id?.toString() || "",
      });
    }
  }, [turmaEditando]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.nome || !form.equipe_id) {
      toast.warn("Preencha os campos obrigatórios.");
      return;
    }

    try {
      setSalvando(true);

      if (turmaEditando) {
        await atualizarTurma(turmaEditando.id, form);
        toast.success("Turma atualizada com sucesso!");
      } else {
        await criarTurma(form);
        toast.success("Turma criada com sucesso!");
      }

      onCriado?.();
      setForm({ nome: "", faixa_etaria: "", equipe_id: "" });
    } catch (error) {
      toast.error("Erro ao salvar turma.");
    } finally {
      setSalvando(false);
    }
  }

  const inputBase =
    "w-full px-3 py-2 rounded-md bg-cor-clara text-cor-escura placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cor-primaria";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Nome da turma *
        </label>
        <input
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          className={inputBase}
          placeholder="Ex: Turma Infantil"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Faixa etária
        </label>
        <input
          type="text"
          name="faixa_etaria"
          value={form.faixa_etaria}
          onChange={handleChange}
          className={inputBase}
          placeholder="Ex: 5 a 8 anos"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Responsável (instrutor) *
        </label>
        <select
          name="equipe_id"
          value={form.equipe_id}
          onChange={handleChange}
          className={inputBase}
        >
          <option value="">Selecione...</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome} ({m.roles.map((r) => r.nome).join(", ")})
            </option>
          ))}
        </select>
        <p className="text-xs text-cor-primaria underline mt-1">
          <a href="/equipe">+ Criar novo membro</a>
        </p>
      </div>

      <button
        type="submit"
        disabled={salvando}
        className="w-full bg-cor-primaria text-white py-2 rounded-md hover:opacity-90"
      >
        {salvando
          ? turmaEditando
            ? "Salvando alterações..."
            : "Salvando..."
          : turmaEditando
          ? "Salvar alterações"
          : "Salvar turma"}
      </button>
    </form>
  );
}

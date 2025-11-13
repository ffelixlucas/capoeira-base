import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { criarTurma, atualizarTurma } from "../../services/turmaService";
import { useEquipe } from "../../hooks/useEquipe";
import InputBase from "../ui/InputBase";
import { logger } from "../../utils/logger";

/**
 * 🧱 Formulário de criação/edição de turma
 * Padrão Capoeira Base v2 (mobile-first + clean + reuso de componentes)
 */
export default function TurmaForm({ onCriado, turmaEditando = null }) {
  const { membros, loading: carregandoEquipe, carregarEquipe } = useEquipe();

  const [form, setForm] = useState({
    nome: "",
    faixa_etaria: "",
    equipe_id: "",
  });

  const [salvando, setSalvando] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* 🔄 Carregar equipe (instrutores)                                          */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    carregarEquipe();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Preenche campos ao editar                                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (turmaEditando) {
      setForm({
        nome: turmaEditando.nome || "",
        faixa_etaria: turmaEditando.faixa_etaria || "",
        equipe_id: turmaEditando.equipe_id?.toString() || "",
      });
    }
  }, [turmaEditando]);

  /* -------------------------------------------------------------------------- */
  /* ⚙️ Handlers                                                              */
  /* -------------------------------------------------------------------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome.trim()) {
      toast.warn("O nome da turma é obrigatório.");
      return;
    }

    // 🧩 Gera faixa_etaria automaticamente com base nos selects
    const faixa_etaria =
      form.idade_min && form.idade_max
        ? `${form.idade_min} a ${form.idade_max}`
        : form.idade_min
        ? `${form.idade_min}+`
        : form.idade_max
        ? `até ${form.idade_max}`
        : null;

    const payload = {
      nome: form.nome,
      faixa_etaria,
      idade_min: form.idade_min ? Number(form.idade_min) : null,
      idade_max: form.idade_max ? Number(form.idade_max) : null,
      equipe_id: form.equipe_id || null,
    };

    try {
      setSalvando(true);

      if (turmaEditando) {
        await atualizarTurma(turmaEditando.id, payload);
        toast.success("Turma atualizada com sucesso!");
        logger.debug("[TurmaForm] Turma atualizada", payload);
      } else {
        await criarTurma(payload);
        toast.success("Turma criada com sucesso!");
        logger.debug("[TurmaForm] Nova turma criada", payload);
      }

      onCriado?.();
      setForm({
        nome: "",
        faixa_etaria: "",
        equipe_id: "",
        idade_min: "",
        idade_max: "",
      });
    } catch (error) {
      logger.error("[TurmaForm] Erro ao salvar turma", { erro: error.message });
      toast.error("Erro ao salvar turma.");
    } finally {
      setSalvando(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🧱 Renderização                                                           */
  /* -------------------------------------------------------------------------- */
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white rounded-xl shadow p-4 border border-gray-200"
    >
      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome da turma *
        </label>
        <InputBase
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Ex: Turma Infantil"
          required
        />
      </div>

      {/* Faixa etária (numérica) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Faixa etária
        </label>

        <div className="flex items-center space-x-2">
          {/* idade mínima */}
          <select
            name="idade_min"
            value={form.idade_min || ""}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 text-gray-700 text-sm"
          >
            <option value="">mín</option>
            {Array.from({ length: 100 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <span className="text-gray-600 text-sm">a</span>

          {/* idade máxima */}
          <select
            name="idade_max"
            value={form.idade_max || ""}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2 text-gray-700 text-sm"
          >
            <option value="">máx</option>
            {Array.from({ length: 100 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <span className="ml-2 text-sm text-gray-500">anos</span>
        </div>
      </div>

      {/* Instrutor responsável */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Responsável (instrutor) *
        </label>

        {carregandoEquipe ? (
          <p className="text-sm text-gray-500">Carregando equipe...</p>
        ) : (
          <select
            name="equipe_id"
            value={form.equipe_id}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-cor-primaria"
          >
            <option value="">Selecione...</option>
            {membros.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} ({m.roles.map((r) => r.nome).join(", ")})
              </option>
            ))}
          </select>
        )}

        <p className="text-xs text-cor-primaria underline mt-1">
          <a href="/equipe">+ Criar novo membro</a>
        </p>
      </div>

      {/* Botão salvar */}
      <button
        type="submit"
        disabled={salvando}
        className="w-full bg-cor-primaria text-white py-2 rounded-md font-medium hover:opacity-90 transition"
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

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { criarTurma, atualizarTurma } from "../../services/turmaService";
import { buscarCategorias } from "../../services/categoriasService";
import { useEquipe } from "../../hooks/useEquipe";
import InputBase from "../ui/InputBase";
import { logger } from "../../utils/logger";

export default function TurmaForm({ onCriado, turmaEditando = null }) {
  const { membros, loading: carregandoEquipe, carregarEquipe } = useEquipe();

  const [salvando, setSalvando] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const [form, setForm] = useState({
    nome: "",
    idade_min: "",
    idade_max: "",
    equipe_id: "",
    categoria_id: "",
    dias: [],
    horario_inicio: "",
    horario_fim: "",
  });

  /* -------------------------------------------------------------------------- */
  /* 🔄 Carregar equipe + categorias                                           */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    carregarEquipe();
    buscarCategorias().then(setCategorias);
  }, []);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Preencher campos ao editar                                             */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (turmaEditando) {
      const { horario } = turmaEditando;

      let horario_inicio = "";
      let horario_fim = "";

      // Compatível com turmas antigas: "19:00 - 20:00"
      if (horario?.includes(" - ")) {
        const [ini, fim] = horario.split(" - ");
        horario_inicio = ini;
        horario_fim = fim;
      }

      setForm({
        nome: turmaEditando.nome || "",
        idade_min: turmaEditando.idade_min || "",
        idade_max: turmaEditando.idade_max || "",
        equipe_id: turmaEditando.equipe_id?.toString() || "",
        categoria_id: turmaEditando.categoria_id?.toString() || "",
        dias: turmaEditando.dias || [],
        horario_inicio,
        horario_fim,
      });
    }
  }, [turmaEditando]);

  /* -------------------------------------------------------------------------- */
  /* ⚙️ Atualiza campos                                                       */
  /* -------------------------------------------------------------------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* -------------------------------------------------------------------------- */
  /* ✔ Validação interna antes de enviar                                      */
  /* -------------------------------------------------------------------------- */
  const validar = () => {
    if (!form.nome.trim()) return "O nome é obrigatório.";
    if (!form.categoria_id) return "Selecione uma categoria.";
    if (!form.equipe_id) return "Selecione um responsável.";
    if (!form.dias.length) return "Selecione pelo menos um dia da semana.";
    if (!form.horario_inicio || !form.horario_fim)
      return "Informe o horário completo.";

    return null;
  };

  /* -------------------------------------------------------------------------- */
  /* 📤 Enviar formulário                                                      */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const erro = validar();
    if (erro) {
      toast.warn(erro);
      return;
    }

    const faixa_etaria =
      form.idade_min && form.idade_max
        ? `${form.idade_min} a ${form.idade_max}`
        : form.idade_min
        ? `${form.idade_min}+`
        : form.idade_max
        ? `até ${form.idade_max}`
        : null;

    const payload = {
      nome: form.nome.trim(),
      idade_min: form.idade_min ? Number(form.idade_min) : null,
      idade_max: form.idade_max ? Number(form.idade_max) : null,
      equipe_id: form.equipe_id || null,
      categoria_id: Number(form.categoria_id),
      faixa_etaria,
      dias: form.dias,
      horario: `${form.horario_inicio} - ${form.horario_fim}`,
    };

    try {
      setSalvando(true);

      if (turmaEditando) {
        await atualizarTurma(turmaEditando.id, payload);
        toast.success("Turma atualizada com sucesso!");
      } else {
        await criarTurma(payload);
        toast.success("Turma criada com sucesso!");
      }

      logger.debug("[TurmaForm] Payload enviado", payload);

      onCriado?.();
      setForm({
        nome: "",
        idade_min: "",
        idade_max: "",
        equipe_id: "",
        categoria_id: "",
        dias: [],
        horario_inicio: "",
        horario_fim: "",
      });
    } catch (error) {
      toast.error("Erro ao salvar turma.");
      logger.error("[TurmaForm] Erro ao salvar", error);
    } finally {
      setSalvando(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🧱 UI                                                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <form
  onSubmit={handleSubmit}
  className="space-y-4 bg-white rounded-xl shadow p-4 border border-gray-200 text-black"
>

  {/* Nome */}
  <div>
    <label className="block text-sm font-medium text-black mb-1">
      Nome *
    </label>
    <InputBase
      name="nome"
      value={form.nome}
      onChange={handleChange}
      placeholder="Ex: Infantil"
      className="text-black"
    />
  </div>

  {/* Faixa etária */}
  <div>
    <label className="block text-sm font-medium text-black mb-1">
      Faixa etária
    </label>

    <div className="flex items-center gap-2">
      <select
        name="idade_min"
        value={form.idade_min || ""}
        onChange={handleChange}
        className="border rounded-lg px-3 py-2 text-black bg-white"
      >
        <option value="">mín</option>
        {Array.from({ length: 100 }, (_, i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>

      <span className="text-black font-semibold">a</span>

      <select
        name="idade_max"
        value={form.idade_max || ""}
        onChange={handleChange}
        className="border rounded-lg px-3 py-2 text-black bg-white"
      >
        <option value="">máx</option>
        {Array.from({ length: 100 }, (_, i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* Responsável */}
  <div>
    <label className="block text-sm font-medium text-black mb-1">
      Responsável *
    </label>

    <select
      name="equipe_id"
      value={form.equipe_id}
      onChange={handleChange}
      className="w-full border rounded-lg px-3 py-2 bg-white text-black"
    >
      <option value="">Selecione...</option>
      {membros.map((m) => (
        <option key={m.id} value={m.id}>
          {m.nome}
        </option>
      ))}
    </select>
  </div>

  {/* Categoria */}
  <div>
    <label className="block text-sm font-medium text-black mb-1">
      Categoria *
    </label>

    <select
      name="categoria_id"
      value={form.categoria_id}
      onChange={handleChange}
      className="w-full border rounded-lg px-3 py-2 bg-white text-black"
    >
      <option value="">Selecione...</option>
      {categorias.map((c) => (
        <option key={c.id} value={c.id}>
          {c.nome}
        </option>
      ))}
    </select>
  </div>

  {/* Dias */}
  <div>
    <label className="block text-sm font-medium text-black mb-1">
      Dias da semana *
    </label>

    <div className="grid grid-cols-3 gap-2 text-sm text-black">
      {["Segunda","Terça","Quarta","Quinta","Sexta","Sábado"].map((dia) => (
        <label key={dia} className="flex items-center gap-2 text-black">
          <input
            type="checkbox"
            checked={form.dias.includes(dia)}
            onChange={(e) => {
              const marcado = e.target.checked;
              setForm((prev) => ({
                ...prev,
                dias: marcado
                  ? [...prev.dias, dia]
                  : prev.dias.filter((d) => d !== dia),
              }));
            }}
          />
          {dia}
        </label>
      ))}
    </div>
  </div>

  {/* Horário */}
  <div>
    <label className="block text-sm font-medium text-black mb-1">
      Horário *
    </label>

    <div className="flex items-center gap-2 text-black">
      <InputBase
        name="horario_inicio"
        value={form.horario_inicio}
        onChange={handleChange}
        placeholder="19:00"
        className="text-black"
      />

      <span className="font-semibold text-black">às</span>

      <InputBase
        name="horario_fim"
        value={form.horario_fim}
        onChange={handleChange}
        placeholder="20:00"
        className="text-black"
      />
    </div>
  </div>

  {/* Botão */}
  <button
    type="submit"
    className="w-full bg-cor-primaria text-white py-2 rounded-md font-medium"
  >
    Salvar turma
  </button>
</form>

  );
}

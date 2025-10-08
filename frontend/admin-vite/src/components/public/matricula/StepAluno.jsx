// src/components/public/matricula/StepAluno.jsx
import InputBase from "../../ui/InputBase";

export default function StepAluno({ form, handleChange }) {
  return (
    <>
      <InputBase
        type="text"
        name="nome"
        placeholder="Nome completo *"
        value={form.nome}
        onChange={handleChange}
        required
      />
      <InputBase
        type="date"
        name="nascimento"
        value={form.nascimento}
        onChange={handleChange}
        required
      />
      <InputBase
        type="text"
        name="cpf"
        placeholder="CPF do Aluno *"
        value={form.cpf}
        onChange={handleChange}
        required
      />

      <p className="text-sm font-medium text-gray-700">Já treinou capoeira?</p>
      <div className="flex gap-3 text-gray-700">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ja_treinou"
            value="sim"
            checked={form.ja_treinou === "sim"}
            onChange={handleChange}
          />
          Sim
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ja_treinou"
            value="nao"
            checked={form.ja_treinou === "nao"}
            onChange={handleChange}
          />
          Não
        </label>
      </div>

      {form.ja_treinou === "sim" && (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">
      Grupo de capoeira
    </label>
    <select
      name="grupo"
      value={form.grupo}
      onChange={handleChange}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white text-sm"
      required
    >
      <option value="">Selecione o grupo</option>
      <option value="Capoeira Brasil">Capoeira Brasil</option>
      <option value="Outros">Outros</option>
    </select>

    {form.grupo === "Outros" && (
      <InputBase
        type="text"
        name="grupo_personalizado"
        placeholder="Digite o nome do grupo"
        value={form.grupo_personalizado || ""}
        onChange={(e) =>
          handleChange({
            target: { name: "grupo_personalizado", value: e.target.value },
          })
        }
        className="mt-2"
        required
      />
    )}
  </div>
)}

    </>
  );
}

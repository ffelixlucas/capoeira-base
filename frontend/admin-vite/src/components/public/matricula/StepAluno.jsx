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
        <>
          <InputBase
            type="text"
            name="apelido"
            placeholder="Apelido"
            value={form.apelido}
            onChange={handleChange}
          />
          <InputBase
            type="text"
            name="grupo"
            placeholder="Grupo de capoeira"
            value={form.grupo}
            onChange={handleChange}
          />
          {form.grupo.toLowerCase().includes("capoeira brasil") && (
            <InputBase
              type="text"
              name="graduacao"
              placeholder="Graduação (corda)"
              value={form.graduacao}
              onChange={handleChange}
            />
          )}
        </>
      )}
    </>
  );
}

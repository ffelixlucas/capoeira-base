// src/components/public/matricula/StepContato.jsx
import InputBase from "../../ui/InputBase";
import { calcularIdade } from "../../../utils/formatters";

export default function StepContato({
  form,
  handleChange,
  possuiRestricao,
  setPossuiRestricao,
}) {
  const idade = calcularIdade(form.nascimento);

  return (
    <>
      <InputBase
        type="email"
        name="email"
        placeholder="E-mail *"
        value={form.email}
        onChange={handleChange}
        required
      />

      <InputBase
        type="text"
        name="endereco"
        placeholder="Endereço"
        value={form.endereco}
        onChange={handleChange}
      />

      {idade >= 18 ? (
        // Adulto → Telefone do aluno
        <InputBase
          type="text"
          name="telefone_aluno"
          placeholder="Telefone do aluno *"
          value={form.telefone_aluno}
          onChange={handleChange}
          required
        />
      ) : (
        <>
          {/* Menor de idade → Telefone do responsável obrigatório */}
          <InputBase
            type="text"
            name="telefone_responsavel"
            placeholder="Telefone do responsável *"
            value={form.telefone_responsavel}
            onChange={handleChange}
            required
          />

          {/* Opcional: telefone do aluno, se já tiver */}
          <InputBase
            type="text"
            name="telefone_aluno"
            placeholder="Telefone do aluno (opcional)"
            value={form.telefone_aluno}
            onChange={handleChange}
          />
        </>
      )}

      <p className="text-sm font-medium text-gray-700 mt-4">
        Possui alguma restrição física?
      </p>
      <div className="flex gap-4 text-gray-700">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="possuiRestricao"
            value="sim"
            checked={possuiRestricao === true}
            onChange={() => setPossuiRestricao(true)}
          />
          Sim
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="possuiRestricao"
            value="nao"
            checked={possuiRestricao === false}
            onChange={() => setPossuiRestricao(false)}
          />
          Não
        </label>
      </div>

      {possuiRestricao && (
        <InputBase
          as="textarea"
          name="observacoes_medicas"
          placeholder="Ex: asma, lesão no joelho, problema de coluna"
          value={form.observacoes_medicas}
          onChange={handleChange}
        />
      )}
    </>
  );
}

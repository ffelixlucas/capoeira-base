// src/components/public/matricula/StepResponsavel.jsx
import InputBase from "../../ui/InputBase";

export default function StepResponsavel({ form, handleChange }) {
  return (
    <>
      <InputBase
        type="text"
        name="nome_responsavel"
        placeholder="Nome do responsável"
        value={form.nome_responsavel}
        onChange={handleChange}
      />
      <InputBase
        type="text"
        name="responsavel_documento"
        placeholder="Documento do responsável (CPF)"
        value={form.responsavel_documento}
        onChange={handleChange}
      />
      <InputBase
        type="text"
        name="responsavel_parentesco"
        placeholder="Parentesco"
        value={form.responsavel_parentesco}
        onChange={handleChange}
      />
      <InputBase
        type="text"
        name="telefone_responsavel"
        placeholder="Telefone do responsável"
        value={form.telefone_responsavel}
        onChange={handleChange}
      />
    </>
  );
}

// components/public/FormInscricaoPublic.jsx
import InputBase from "../../components/ui/InputBase";

export default function FormInscricaoPublic({
  form,
  setForm,
  idade,
  enviando,
  handleSubmit,
  setModalLGPD,
  formatarTelefone,
  formatarCPF,
}) {
  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white rounded-xl p-6 shadow-lg border border-gray-200"
    >
      {/* Dados básicos */}
      <InputBase
        name="nome"
        placeholder="Nome completo"
        value={form.nome}
        onChange={handleChange}
        required
      />
      <InputBase
        name="apelido"
        placeholder="Apelido"
        value={form.apelido}
        onChange={handleChange}
      />
      <InputBase
        type="date"
        name="data_nascimento"
        value={form.data_nascimento}
        onChange={handleChange}
        required
      />
      <InputBase
        type="email"
        name="email"
        placeholder="E-mail"
        value={form.email}
        onChange={handleChange}
      />
      <InputBase
        type="tel"
        name="telefone"
        placeholder="Telefone (WhatsApp)"
        value={form.telefone}
        onChange={(e) =>
          setForm({ ...form, telefone: formatarTelefone(e.target.value) })
        }
      />
      <InputBase
        name="cpf"
        placeholder="CPF"
        value={form.cpf}
        onChange={(e) => setForm({ ...form, cpf: formatarCPF(e.target.value) })}
      />

      {/* Dados do responsável */}
      {idade !== null && idade < 18 && (
        <div className="border-t pt-3 space-y-2">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Responsável (menor de idade)
          </p>
          <InputBase
            name="responsavel_nome"
            placeholder="Nome do responsável"
            value={form.responsavel_nome}
            onChange={handleChange}
            required
          />
          <InputBase
            name="responsavel_documento"
            placeholder="Documento do responsável (CPF)"
            value={form.responsavel_documento}
            onChange={(e) =>
              setForm({
                ...form,
                responsavel_documento: formatarCPF(e.target.value),
              })
            }
            required
          />
          <InputBase
            name="responsavel_contato"
            placeholder="Telefone do responsável"
            value={form.responsavel_contato}
            onChange={(e) =>
              setForm({
                ...form,
                responsavel_contato: formatarTelefone(e.target.value),
              })
            }
            required
          />
          <InputBase
            name="responsavel_parentesco"
            placeholder="Parentesco"
            value={form.responsavel_parentesco}
            onChange={handleChange}
          />
        </div>
      )}

      {/* Outros campos */}
      <select
        name="tamanho_camiseta"
        value={form.tamanho_camiseta}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2 text-black text-sm"
      >
        <option value="">Tamanho da camiseta</option>
        <option value="P">P</option>
        <option value="M">M</option>
        <option value="G">G</option>
        <option value="GG">GG</option>
      </select>

      {/* Restrições médicas */}
      <label className="flex items-center gap-2 text-black text-sm">
        <input
          type="checkbox"
          name="tem_restricoes"
          checked={form.tem_restricoes || false}
          onChange={handleChange}
          className="h-4 w-4"
        />
        Possui alguma restrição médica?
      </label>

      {form.tem_restricoes && (
        <InputBase
          as="textarea"
          name="alergias_restricoes"
          placeholder="Descreva a restrição médica"
          value={form.alergias_restricoes}
          onChange={handleChange}
          rows={2}
        />
      )}

      {/* Aceites obrigatórios */}
      <label className="flex items-center gap-2 text-black text-sm">
        <input
          type="checkbox"
          name="aceite_lgpd"
          checked={form.aceite_lgpd}
          onChange={handleChange}
          className="h-4 w-4"
          required
        />
        <span>
          Li e aceito a{" "}
          <button
            type="button"
            className="underline text-blue-600"
            onClick={() => setModalLGPD(true)}
          >
            Política de Privacidade e LGPD
          </button>
        </span>
      </label>

      <label className="flex items-center gap-2 text-black text-sm">
        <input
          type="checkbox"
          name="autorizacao_imagem"
          checked={form.autorizacao_imagem}
          onChange={handleChange}
          className="h-4 w-4"
          required
        />
        Autorizo o uso de minha imagem em fotos e vídeos do evento
      </label>

      {/* Botão */}
      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Confirmar inscrição"}
      </button>
    </form>
  );
}

// components/public/FormInscricaoPublic.jsx
import InputBase from "../../components/ui/InputBase";
import { calcularValorComTaxa } from "../../utils/calcularValor";

export default function FormInscricaoPublic({
  form,
  setForm,
  idade,
  enviando,
  handleSubmit,
  setModalLGPD,
  formatarTelefone,
  formatarCPF,
  evento,
}) {
  
  const valorComTaxa = calcularValorComTaxa(evento?.valor || 0, "cartao");

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  const graduacoesPorCategoria = {
    Infantil: [
      "Branca",
      "Ponta Amarela",
      "Ponta Laranja",
      "Ponta Azul",
      "Ponta Verde",
      "Ponta Roxa",
      "Ponta Marrom",
    ],
    Juvenil: [
      "Branca",
      "Branca / Amarela",
      "Branca / Laranja",
      "Branca / Azul",
      "Branca / Verde",
      "Branca / Roxa",
      "Branca / Marrom",
    ],
    "Jovens e Adultos": [
      "Branca",
      "Branca e Amarela",
      "Amarela",
      "Branca e Laranja",
      "Laranja",
      "Vermelha e Azul",
      "Azul",
      "Verde",
      "Roxa",
      "Marrom",
      "Preta",
    ],
  };

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
      <div className="flex flex-col gap-1">
        <label
          htmlFor="data_nascimento"
          className="text-sm text-gray-700 font-medium"
        >
          Data de nascimento
        </label>
        <InputBase
          type="date"
          id="data_nascimento"
          name="data_nascimento"
          value={form.data_nascimento}
          onChange={handleChange}
          required
        />
      </div>
      <InputBase
        type="email"
        name="email"
        placeholder="E-mail"
        value={form.email}
        onChange={handleChange}
        required
      />
      <InputBase
        type="tel"
        name="telefone"
        placeholder="Telefone (WhatsApp)"
        value={form.telefone}
        onChange={(e) =>
          setForm({ ...form, telefone: formatarTelefone(e.target.value) })
        }
        required
      />
      <InputBase
        name="cpf"
        placeholder="CPF do participante"
        value={form.cpf}
        onChange={(e) => setForm({ ...form, cpf: formatarCPF(e.target.value) })}
        required
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
            required
          />
        </div>
      )}

      {/* Outros campos */}
      {evento && Number(evento.possui_camiseta) === 1 && (
        <select
          name="tamanho_camiseta"
          value={form.tamanho_camiseta}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-black text-sm"
          required
        >
          <option value="">Tamanho da camiseta</option>
          {evento?.configuracoes?.camiseta_tamanhos?.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}
      {/* Categoria */}
      <select
        name="categoria"
        value={form.categoria}
        onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2 text-black text-sm"
        required
      >
        <option value="">Selecione a categoria</option>
        <option value="Infantil">Infantil (4 a 10 anos)</option>
        <option value="Juvenil">Juvenil (11 a 16 anos)</option>
        <option value="Jovens e Adultos">Jovens e Adultos (17+)</option>
      </select>

      {/* Graduação (dependente da categoria) */}
      {form.categoria && (
        <select
          name="graduacao"
          value={form.graduacao}
          onChange={handleChange}
          className="w-full border rounded-lg px-3 py-2 text-black text-sm"
          required
        >
          <option value="">Selecione a graduação</option>
          {graduacoesPorCategoria[form.categoria].map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
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

      {/* Escolha de forma de pagamento */}
      <div className="border-t pt-3 space-y-2">
        <p className="text-sm font-semibold text-gray-700">
          Forma de pagamento
        </p>
        <label className="flex items-center gap-2 text-black text-sm">
          <input
            type="radio"
            name="metodo_pagamento"
            value="pix"
            checked={form.metodo_pagamento === "pix"}
            onChange={(e) =>
              setForm({ ...form, metodo_pagamento: e.target.value })
            }
            required
          />
          <span>Pix — R$ {evento?.valor}</span>
        </label>
        <label className="flex items-center gap-2 text-black text-sm">
          <input
            type="radio"
            name="metodo_pagamento"
            value="cartao"
            checked={form.metodo_pagamento === "cartao"}
            onChange={(e) =>
              setForm({ ...form, metodo_pagamento: e.target.value })
            }
            required
          />
           <span>Cartão — R$ {valorComTaxa.toFixed(2)} + taxas de parcelamento</span>

        </label>
      </div>

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

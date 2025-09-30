// components/public/FormInscricaoPublic.jsx
import { useState, useEffect } from "react";
import InputBase from "../../components/ui/InputBase";
import { calcularValorComTaxa } from "../../utils/calcularValor";
import { motion } from "framer-motion";
import { CreditCard, Landmark, QrCode, CheckCircle2 } from "lucide-react";
import { buscarValoresEvento } from "../../services/public/inscricaoPublicService";

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

  const [valores, setValores] = useState(null);
  useEffect(() => {
    if (evento?.id) {
      buscarValoresEvento(evento.id).then(setValores);
    }
  }, [evento]);

  // 🔹 Componente auxiliar dentro do FormInscricaoPublic.jsx
  const MetodoPagamentoCard = ({
    ativo,
    onClick,
    cor,
    icon: Icon,
    label,
    valor,
    descricao, // 👈 adicionamos aqui
  }) => (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors shadow-sm text-center
      ${
        ativo
          ? `${cor.border} ${cor.bg}`
          : "border-gray-200 bg-white hover:bg-gray-50"
      }
    `}
    >
      <Icon className={`w-6 h-6 mb-1 ${cor.icon}`} />
      <span className="text-xs font-medium text-gray-800">{label}</span>
      <span className="text-sm font-semibold text-gray-900">R$ {valor}</span>

      {/* 👇 só aparece se tiver descricao */}
      {descricao && (
        <span className="block text-xs text-gray-500 mt-0.5">{descricao}</span>
      )}

      {ativo && (
        <CheckCircle2
          className={`w-4 h-4 absolute top-2 right-2 ${cor.icon}`}
        />
      )}
    </motion.button>
  );

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

      <div className="border-t pt-6 space-y-4">
        <p className="text-sm font-semibold text-gray-700">
          Escolha a forma de pagamento!
        </p>

        <div className="grid grid-cols-3 gap-3">
          {/* Pix */}
          <MetodoPagamentoCard
            ativo={form.metodo_pagamento === "pix"}
            onClick={() => setForm({ ...form, metodo_pagamento: "pix" })}
            cor={{
              border: "border-green-500",
              bg: "bg-green-50",
              icon: "text-green-600",
            }}
            icon={QrCode}
            label="Pix"
            valor={valores?.pix?.toFixed(2)}
          />

          <MetodoPagamentoCard
            ativo={form.metodo_pagamento === "cartao"}
            onClick={() => setForm({ ...form, metodo_pagamento: "cartao" })}
            cor={{
              border: "border-blue-500",
              bg: "bg-blue-50",
              icon: "text-blue-600",
            }}
            icon={CreditCard}
            label="Cartão"
            valor={valores?.cartao?.toFixed(2)}
            descricao="com taxas de processamento"
          />

          <MetodoPagamentoCard
            ativo={form.metodo_pagamento === "boleto"}
            onClick={() => setForm({ ...form, metodo_pagamento: "boleto" })}
            cor={{
              border: "border-yellow-500",
              bg: "bg-yellow-50",
              icon: "text-yellow-600",
            }}
            icon={Landmark}
            label="Boleto"
            valor={valores?.boleto?.toFixed(2)}
            descricao="com taxas de processamento"
          /> 
        </div>
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

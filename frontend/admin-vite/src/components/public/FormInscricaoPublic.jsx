// components/public/FormInscricaoPublic.jsx
import { createElement, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import InputBase from "../../components/ui/InputBase";
import { CreditCard, Landmark, QrCode, CheckCircle2 } from "lucide-react";
import {
  buscarCategoriasPublicas,
  buscarGraduacoesPublicas,
  buscarValoresEvento,
} from "../../services/public/inscricaoPublicService";

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
  const { slug } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [graduacoesDaCategoria, setGraduacoesDaCategoria] = useState([]);
  const idadeMinima = Number(evento?.configuracoes?.idade_minima || 0);
  const idadeMinimaNaoAtendida =
    idade !== null && idadeMinima > 0 && idade < idadeMinima;
  const [anoNascimento = "", mesNascimento = "", diaNascimento = ""] =
    form.data_nascimento ? form.data_nascimento.split("-") : ["", "", ""];
  const anoAtual = new Date().getFullYear();
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function atualizarDataNascimento(parte, valor) {
    const proximoAno = anoNascimento || "";
    const proximoMes = mesNascimento || "";
    const proximoDia = diaNascimento || "";

    const partes = {
      ano: proximoAno,
      mes: proximoMes,
      dia: proximoDia,
      [parte]: valor,
    };

    const dataCompleta =
      partes.ano && partes.mes && partes.dia
        ? `${partes.ano}-${partes.mes}-${partes.dia}`
        : [partes.ano, partes.mes, partes.dia].filter(Boolean).join("-");

    setForm((prev) => ({
      ...prev,
      data_nascimento: dataCompleta,
    }));
  }

  function handleCategoriaChange(e) {
    const categoriaId = e.target.value;
    setForm((prev) => ({
      ...prev,
      categoria_id: categoriaId, // salva id
      graduacao_id: "", // reseta graduacao
    }));
  }

  function handleGraduacaoChange(e) {
    setForm((prev) => ({
      ...prev,
      graduacao_id: e.target.value,
    }));
  }

  const [valores, setValores] = useState(null);

  useEffect(() => {
    if (!slug) return;

    buscarCategoriasPublicas(slug)
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, [slug]);

  useEffect(() => {
    if (!slug || !form.categoria_id) {
      setGraduacoesDaCategoria([]);
      return;
    }

    buscarGraduacoesPublicas(slug, form.categoria_id)
      .then(setGraduacoesDaCategoria)
      .catch(() => setGraduacoesDaCategoria([]));
  }, [slug, form.categoria_id]);

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
    icon,
    label,
    valor,
    descricao, // 👈 adicionamos aqui
  }) => {
    const iconNode = createElement(icon, {
      className: `w-6 h-6 mb-1 ${cor.icon}`,
    });

    return (
      <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-colors shadow-sm text-center
      ${
        ativo
          ? `${cor.border} ${cor.bg}`
          : "border-gray-200 bg-white hover:bg-gray-50"
      }
    `}
    >
      {iconNode}
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
    </button>
    );
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
        <label className="text-sm text-gray-700 font-medium">
          Data de nascimento
        </label>
        <div className="grid grid-cols-3 gap-2">
          <select
            name="dia_nascimento"
            value={diaNascimento ? Number(diaNascimento) : ""}
            onChange={(e) =>
              atualizarDataNascimento("dia", e.target.value.padStart(2, "0"))
            }
            className="w-full border rounded-lg px-3 py-2 text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Dia</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <select
            name="mes_nascimento"
            value={mesNascimento ? Number(mesNascimento) : ""}
            onChange={(e) =>
              atualizarDataNascimento("mes", e.target.value.padStart(2, "0"))
            }
            className="w-full border rounded-lg px-3 py-2 text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Mês</option>
            {meses.map((mes, index) => (
              <option key={mes} value={index + 1}>
                {mes}
              </option>
            ))}
          </select>

          <select
            name="ano_nascimento"
            value={anoNascimento ? Number(anoNascimento) : ""}
            onChange={(e) => atualizarDataNascimento("ano", e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-black text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Ano</option>
            {Array.from({ length: 100 }, (_, i) => anoAtual - i).map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>
        {idadeMinima > 0 && (
          <p
            className={`text-xs ${
              idadeMinimaNaoAtendida ? "text-red-600" : "text-gray-500"
            }`}
          >
            Idade minima para este evento: {idadeMinima} anos.
          </p>
        )}
        {idadeMinimaNaoAtendida && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Inscrição indisponível para esta data de nascimento. Este evento
            aceita participantes somente a partir de {idadeMinima} anos.
          </div>
        )}
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
        name="categoria_id"
        value={form.categoria_id || ""}
        onChange={handleCategoriaChange}
        className="w-full border rounded-lg px-3 py-2 text-black text-sm"
        required
      >
        <option value="">Selecione a categoria</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      {/* Graduação */}
      {form.categoria_id && (
        <select
          name="graduacao_id"
          value={form.graduacao_id || ""}
          onChange={handleGraduacaoChange}
          className="w-full border rounded-lg px-3 py-2 text-black text-sm"
          required
        >
          <option value="">Selecione a graduação</option>
          {graduacoesDaCategoria.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome}
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
        disabled={enviando || idadeMinimaNaoAtendida}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium disabled:opacity-60"
      >
        {enviando
          ? "Enviando..."
          : idadeMinimaNaoAtendida
            ? `Disponivel a partir de ${idadeMinima} anos`
            : "Confirmar inscrição"}
      </button>
    </form>
  );
}

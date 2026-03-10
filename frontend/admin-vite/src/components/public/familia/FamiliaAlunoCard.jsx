import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Pencil, X } from "lucide-react";
import { toast } from "react-toastify";
import { uploadFotoAlunoFamilia } from "../../../services/familiaPortalService";

export default function FamiliaAlunoCard({ aluno, onSalvar }) {
  const [editando, setEditando] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(aluno.foto_url || "");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const inputFotoRef = useRef(null);
  const [form, setForm] = useState({
    nome: aluno.nome || "",
    apelido: aluno.apelido || "",
    nascimento: aluno.nascimento || "",
    email: aluno.email || "",
    telefone_aluno: aluno.telefone_aluno || "",
    nao_possui_celular: !aluno.telefone_aluno,
    telefone_responsavel: aluno.telefone_responsavel || "",
    nome_responsavel: aluno.nome_responsavel || "",
    responsavel_parentesco: aluno.responsavel_parentesco || "",
    endereco: aluno.endereco || "",
    observacoes_medicas: aluno.observacoes_medicas || "",
  });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setFotoUrl(aluno.foto_url || "");
    setForm({
      nome: aluno.nome || "",
      apelido: aluno.apelido || "",
      nascimento: aluno.nascimento || "",
      email: aluno.email || "",
      telefone_aluno: aluno.telefone_aluno || "",
      nao_possui_celular: !aluno.telefone_aluno,
      telefone_responsavel: aluno.telefone_responsavel || "",
      nome_responsavel: aluno.nome_responsavel || "",
      responsavel_parentesco: aluno.responsavel_parentesco || "",
      endereco: aluno.endereco || "",
      observacoes_medicas: aluno.observacoes_medicas || "",
    });
  }, [aluno]);

  const nomeBase = aluno.apelido || aluno.nome || "Aluno";
  const iniciais = nomeBase
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    if (name === "nao_possui_celular") {
      setForm((prev) => ({
        ...prev,
        nao_possui_celular: checked,
        telefone_aluno: checked ? "" : prev.telefone_aluno,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await onSalvar(aluno.id, {
        ...form,
        telefone_aluno: form.nao_possui_celular ? null : form.telefone_aluno,
      });
      setEditando(false);
    } finally {
      setSalvando(false);
    }
  }

  async function handleFotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setEnviandoFoto(true);
      const resposta = await uploadFotoAlunoFamilia(aluno.id, file);
      setFotoUrl(resposta.url || "");
      toast.success("Foto do aluno atualizada com sucesso.");
    } catch (error) {
      toast.error(
        error?.response?.data?.error || "Não foi possível atualizar a foto."
      );
    } finally {
      setEnviandoFoto(false);
      if (inputFotoRef.current) {
        inputFotoRef.current.value = "";
      }
    }
  }

  const percentualPresenca = Math.round(
    Number(aluno.metricas?.taxa_presenca || 0) * 100
  );
  const faltas = Number(aluno.metricas?.faltas || 0);
  const totalAulas = Number(aluno.metricas?.total || 0);

  const indicador = useMemo(() => {
    if (percentualPresenca >= 85) {
      return {
        bg: "#16a34a",
        soft: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }

    if (percentualPresenca >= 70) {
      return {
        bg: "#f59e0b",
        soft: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      bg: "#e11d48",
      soft: "bg-rose-50 text-rose-700 border-rose-200",
    };
  }, [percentualPresenca]);

  const ringStyle = {
    background: `conic-gradient(${indicador.bg} ${percentualPresenca}%, #e2e8f0 ${percentualPresenca}% 100%)`,
  };

  const nascimentoFormatado = aluno.nascimento
    ? new Date(`${aluno.nascimento}T12:00:00`).toLocaleDateString("pt-BR")
    : "Não informado";

  const etiquetas = useMemo(() => {
    const base = [
      aluno.turma_nome || "Turma não definida",
      aluno.categoria_nome || "Sem categoria",
      aluno.graduacao_nome || "Sem graduação",
    ];

    const vistos = new Set();

    return base.filter((item) => {
      const chave = String(item).trim().toLowerCase();
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
  }, [aluno.turma_nome, aluno.categoria_nome, aluno.graduacao_nome]);

  return (
    <article className="overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
      {/* Card Principal */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          {/* Informações principais - flexível */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 shadow-sm sm:h-20 sm:w-20">
                    {fotoUrl ? (
                      <img
                        src={fotoUrl}
                        alt={aluno.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-black text-slate-600 sm:text-lg">
                        {iniciais || "A"}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => inputFotoRef.current?.click()}
                    disabled={enviandoFoto}
                    className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-slate-900 text-white shadow-md transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
                    aria-label="Trocar foto do aluno"
                  >
                    <Camera size={13} />
                  </button>

                  <input
                    ref={inputFotoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFotoChange}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  {aluno.apelido ? (
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-slate-900 sm:text-lg">
                        {aluno.apelido}
                      </h2>
                      <p className="truncate text-sm italic text-slate-500">
                        {aluno.nome}
                      </p>
                    </div>
                  ) : (
                    <h2 className="truncate text-base font-black text-slate-900 sm:text-lg">
                      {aluno.nome}
                    </h2>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {etiquetas.map((etiqueta) => (
                      <span
                        key={etiqueta}
                        className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-stone-700"
                      >
                        {etiqueta}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditando((prev) => !prev)}
                className="flex-shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-slate-600 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 hover:scale-105"
                aria-label={editando ? "Fechar edição" : "Editar ficha"}
              >
                <Pencil size={14} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-[minmax(0,1fr)_84px] items-start gap-3 sm:grid-cols-[minmax(0,1fr)_96px]">
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-slate-500 whitespace-nowrap">Nascimento:</span>
                  <span className="text-slate-800 truncate">{nascimentoFormatado}</span>
                </div>

                {aluno.telefone_aluno ? (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-slate-500 whitespace-nowrap">Telefone:</span>
                    <span className="text-slate-800 truncate">{aluno.telefone_aluno}</span>
                  </div>
                ) : null}

                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-slate-500 whitespace-nowrap">Responsável:</span>
                  <span className="text-slate-800 truncate">
                    {aluno.nome_responsavel || "Não informado"}
                  </span>
                </div>

                {aluno.email ? (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-slate-500 whitespace-nowrap">E-mail:</span>
                    <span className="text-slate-800 truncate">{aluno.email}</span>
                  </div>
                ) : null}

                {aluno.endereco ? (
                  <div className="flex items-start gap-1.5 min-w-0">
                    <span className="font-semibold text-slate-500 whitespace-nowrap">Endereço:</span>
                    <span className="text-slate-800 leading-5">{aluno.endereco}</span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col items-center gap-2.5 pt-0.5">
                <div
                  className="relative h-14 w-14 rounded-full p-1 sm:h-16 sm:w-16"
                  style={ringStyle}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-sm font-black text-slate-900 sm:text-base">
                      {percentualPresenca}%
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">
                      pres.
                    </span>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-center rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wider sm:px-3 sm:text-xs ${indicador.soft}`}
                >
                  {faltas} {faltas === 1 ? "falta" : "faltas"}
                </div>
                {totalAulas > 0 ? (
                  <p className="text-center text-[10px] font-medium text-slate-500 sm:text-[11px]">
                    em {totalAulas} {totalAulas === 1 ? "aula" : "aulas"}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé com observações */}
      <div className="border-t border-stone-200 bg-stone-50 px-4 sm:px-5 py-2.5">
        {aluno.observacoes_medicas ? (
          <p className="text-xs sm:text-sm text-slate-600 truncate">
            <span className="font-semibold text-slate-700">Observações:</span>{" "}
            {aluno.observacoes_medicas}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-slate-500 italic">
            Toque na caneta para editar as informações do aluno.
          </p>
        )}
      </div>

      {/* Modal de Edição - Melhorado para mobile */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setEditando(false)}
            aria-hidden="true"
          />

          <form
            onSubmit={handleSubmit}
            className="relative z-10 w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300"
          >
            {/* Cabeçalho do Modal */}
            <div className="sticky top-0 z-10 border-b border-stone-200 bg-gradient-to-br from-amber-50 to-white px-4 sm:px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-700">
                    Editar ficha
                  </p>
                  <h3 className="mt-1 text-lg sm:text-xl font-black text-slate-900 truncate">
                    {aluno.nome}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">
                    Atualize somente os dados que realmente mudaram.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="flex-shrink-0 inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-600 transition hover:bg-stone-50 hover:scale-105"
                  aria-label="Fechar modal"
                >
                  <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal - Scrollável */}
            <div className="overflow-y-auto p-4 sm:p-6" style={{ maxHeight: "calc(90vh - 140px)" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Nome completo
                  </label>
                  <input
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Nome completo"
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                  />
                </div>

                {/* Apelido */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Apelido
                  </label>
                  <input
                    name="apelido"
                    value={form.apelido}
                    onChange={handleChange}
                    placeholder="Apelido (opcional)"
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                  />
                </div>

                {/* Nascimento */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    name="nascimento"
                    value={form.nascimento || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    E-mail do responsável
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                  />
                </div>

                {/* Telefone do Aluno */}
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Telefone do aluno
                  </label>
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 mb-2">
                    <input
                      type="checkbox"
                      name="nao_possui_celular"
                      checked={form.nao_possui_celular}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-stone-300 text-sky-600 focus:ring-sky-500"
                    />
                    Não possui celular
                  </label>
                  <input
                    name="telefone_aluno"
                    value={form.telefone_aluno}
                    onChange={handleChange}
                    placeholder="Telefone do aluno"
                    disabled={form.nao_possui_celular}
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-slate-400"
                  />
                </div>

                {/* Telefone do Responsável */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Telefone do responsável
                  </label>
                  <input
                    name="telefone_responsavel"
                    value={form.telefone_responsavel}
                    onChange={handleChange}
                    placeholder="Telefone do responsável"
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                  />
                </div>

                {/* Nome do Responsável */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Nome do responsável
                  </label>
                  <input
                    name="nome_responsavel"
                    value={form.nome_responsavel}
                    onChange={handleChange}
                    placeholder="Nome do responsável"
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                  />
                </div>

                {/* Parentesco */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Parentesco
                  </label>
                  <input
                    name="responsavel_parentesco"
                    value={form.responsavel_parentesco}
                    onChange={handleChange}
                    placeholder="Parentesco"
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                  />
                </div>

                {/* Endereço */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Endereço completo
                  </label>
                  <input
                    name="endereco"
                    value={form.endereco}
                    onChange={handleChange}
                    placeholder="Endereço completo"
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                  />
                </div>

                {/* Observações Médicas */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700">
                    Observações médicas
                  </label>
                  <textarea
                    name="observacoes_medicas"
                    value={form.observacoes_medicas}
                    onChange={handleChange}
                    placeholder="Observações médicas importantes (alergias, condições, etc.)"
                    rows={4}
                    className="w-full rounded-lg sm:rounded-xl border border-stone-300 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-slate-900 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="sticky bottom-0 border-t border-stone-200 bg-stone-50 px-4 sm:px-6 py-4">
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-stone-300 bg-white text-sm font-medium text-slate-700 transition hover:bg-stone-100 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-sm font-semibold text-white transition hover:from-sky-600 hover:to-sky-700 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {salvando ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Salvando...
                    </span>
                  ) : (
                    "Salvar alterações"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}

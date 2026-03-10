import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Wallet,
  X,
} from "lucide-react";

const TABELA_CN10 = [
  { id: "infantil", label: "Infantil", valor: "R$ 65,00" },
  { id: "juvenil", label: "Juvenil", valor: "R$ 79,00" },
  { id: "adulto", label: "Adultos", valor: "R$ 99,00" },
];

const COMPETENCIAS_BASE = [
  { id: "2026-04", mes: "Abril de 2026", vencimento: "10/04/2026", status: "disponivel" },
  { id: "2026-03", mes: "Março de 2026", vencimento: "10/03/2026", status: "paga" },
  { id: "2026-02", mes: "Fevereiro de 2026", vencimento: "10/02/2026", status: "paga" },
];

const HISTORICO_PAGO_BASE = [
  { id: "2026-03", mes: "Março", ano: 2026, pagoEm: "10/03/2026" },
  { id: "2026-02", mes: "Fevereiro", ano: 2026, pagoEm: "09/02/2026" },
  { id: "2026-01", mes: "Janeiro", ano: 2026, pagoEm: "10/01/2026" },
  { id: "2025-12", mes: "Dezembro", ano: 2025, pagoEm: "10/12/2025" },
  { id: "2025-11", mes: "Novembro", ano: 2025, pagoEm: "11/11/2025" },
  { id: "2025-10", mes: "Outubro", ano: 2025, pagoEm: "10/10/2025" },
];

const STATUS_MAP = {
  disponivel: {
    label: "Disponível",
    chip: "border-sky-200 bg-sky-50 text-sky-700",
    card: "border-sky-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]",
    action: "Pagar mensalidade",
  },
  paga: {
    label: "Paga",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    card: "border-emerald-200 bg-[linear-gradient(180deg,#f7fdf9_0%,#ffffff_100%)]",
    action: "Comprovante registrado",
  },
};

function inferirFaixa(aluno) {
  const categoria = `${aluno?.categoria_nome || ""}`.toLowerCase();

  if (categoria.includes("infantil")) return TABELA_CN10[0];
  if (categoria.includes("juvenil")) return TABELA_CN10[1];
  return TABELA_CN10[2];
}

export default function FamiliaMensalidadesMock({ alunos = [] }) {
  const [indiceCompetencia, setIndiceCompetencia] = useState(0);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState(alunos[0]?.id ?? null);
  const [historicoAberto, setHistoricoAberto] = useState(false);

  const alunoSelecionado = useMemo(() => {
    return alunos.find((aluno) => aluno.id === alunoSelecionadoId) || alunos[0] || null;
  }, [alunoSelecionadoId, alunos]);

  const faixaAtual = useMemo(() => inferirFaixa(alunoSelecionado), [alunoSelecionado]);

  const competencias = useMemo(() => {
    return COMPETENCIAS_BASE.map((item, index) => ({
      ...item,
      valor: faixaAtual.valor,
      turma: faixaAtual.label,
      observacao:
        index === 0
          ? "Lembrando dos nossos compromissos mensais. Pagamento até dia 10 de cada mês."
          : "Pagamento registrado no portal do aluno.",
    }));
  }, [faixaAtual]);

  const atual = competencias[indiceCompetencia];
  const status = STATUS_MAP[atual.status];

  const historicoCompleto = useMemo(() => {
    return HISTORICO_PAGO_BASE.map((item) => ({
      ...item,
      valor: faixaAtual.valor,
    }));
  }, [faixaAtual]);

  const anosDisponiveis = useMemo(() => {
    return [...new Set(historicoCompleto.map((item) => item.ano))].sort((a, b) => b - a);
  }, [historicoCompleto]);

  const [anoSelecionado, setAnoSelecionado] = useState(() => anosDisponiveis[0] ?? new Date().getFullYear());

  const historicoFiltrado = useMemo(() => {
    return historicoCompleto.filter((item) => item.ano === Number(anoSelecionado));
  }, [anoSelecionado, historicoCompleto]);

  if (!alunoSelecionado) return null;

  function anterior() {
    setIndiceCompetencia((prev) =>
      prev === 0 ? competencias.length - 1 : prev - 1
    );
  }

  function proximo() {
    setIndiceCompetencia((prev) =>
      prev === competencias.length - 1 ? 0 : prev + 1
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
      <div className="border-b border-stone-200 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              Mensalidade
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900">
              Compromissos mensais do aluno
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Valor do aluno, vencimento e histórico recente em um lugar só.
            </p>
          </div>

          {alunos.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {alunos.map((aluno) => {
                const ativo = aluno.id === alunoSelecionado.id;

                return (
                  <button
                    key={aluno.id}
                    type="button"
                    onClick={() => setAlunoSelecionadoId(aluno.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      ativo
                        ? "border-amber-300 bg-amber-50 text-amber-700"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {aluno.nome}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className={`rounded-[24px] border p-4 sm:p-5 ${status.card}`}>
          <div className="border-b border-stone-200/80 pb-4">
            <div className="flex items-center justify-between gap-3">
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${status.chip}`}>
                {status.label}
              </span>

              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Valor
                </p>
                <p className="mt-1 text-3xl font-black leading-none text-slate-900 sm:text-[2.2rem]">
                  {atual.valor}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Competência
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-900">
                  {atual.mes}
                </h3>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Aluno
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-800">
                  {alunoSelecionado.nome}
                </p>
                <p className="text-sm text-stone-500">{atual.turma}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-0">
            <div className="sm:pr-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Categoria
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">{atual.turma}</p>
            </div>

            <div className="sm:border-l sm:border-stone-200/80 sm:px-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Vencimento
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">{atual.vencimento}</p>
            </div>

            <div className="sm:border-l sm:border-stone-200/80 sm:pl-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                Regra
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">Pagamento até dia 10</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-stone-600">{atual.observacao}</p>

          <button
            type="button"
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white transition ${
              atual.status === "paga"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {atual.status === "paga" ? <CircleCheckBig size={18} /> : <Wallet size={18} />}
            {status.action}
          </button>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={anterior}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-slate-600 transition hover:border-stone-300 hover:bg-stone-50"
              aria-label="Competência anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex flex-1 gap-1.5">
              {competencias.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndiceCompetencia(index)}
                  className={`h-2 flex-1 rounded-full transition ${
                    index === indiceCompetencia ? "bg-slate-900" : "bg-stone-200"
                  }`}
                  aria-label={item.mes}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={proximo}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-slate-600 transition hover:border-stone-300 hover:bg-stone-50"
              aria-label="Próxima competência"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="mt-5 border-t border-stone-200/80 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                Histórico recente
              </p>
              <button
                type="button"
                onClick={() => setHistoricoAberto(true)}
                className="text-xs font-semibold text-slate-700 transition hover:text-slate-900"
              >
                Histórico completo
              </button>
            </div>
            <div className="mt-3 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
              {competencias.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-3 first:rounded-t-2xl last:rounded-b-2xl sm:px-4"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.mes}</p>
                    <p className="text-xs text-stone-500">Vencimento {item.vencimento}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                      STATUS_MAP[item.status].chip
                    }`}
                  >
                    {STATUS_MAP[item.status].label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {historicoAberto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 sm:p-6">
          <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Histórico completo
                </p>
                <h3 className="mt-1 text-lg font-black text-slate-900">
                  Mensalidades pagas
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  {alunoSelecionado.nome}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHistoricoAberto(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-slate-500 transition hover:border-stone-300 hover:bg-stone-50 hover:text-slate-700"
                aria-label="Fechar histórico"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Ano
                </label>
                <select
                  value={anoSelecionado}
                  onChange={(event) => setAnoSelecionado(Number(event.target.value))}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                >
                  {anosDisponiveis.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <div className="grid grid-cols-[minmax(0,1fr)_110px_90px] gap-3 border-b border-stone-200 bg-stone-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                  <span>Mês</span>
                  <span className="text-right">Valor</span>
                  <span className="text-right">Pago</span>
                </div>

                {historicoFiltrado.length > 0 ? (
                  historicoFiltrado.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(0,1fr)_110px_90px] gap-3 border-b border-stone-200 px-4 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {item.mes}
                        </p>
                      </div>
                      <p className="text-right text-sm font-semibold text-slate-700">
                        {item.valor}
                      </p>
                      <p className="text-right text-sm text-emerald-700">
                        Pago
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-stone-500">
                    Nenhum pagamento registrado para {anoSelecionado}.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

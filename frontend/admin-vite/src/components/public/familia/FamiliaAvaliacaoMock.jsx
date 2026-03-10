import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { useFamilyAuth } from "../../../hooks/useFamilyAuth";

const AVALIACOES_BASE = {
  infantil: {
    periodo: "1º semestre 2026",
    data: "15/06/2026",
    professor: "Professor responsável",
    habilidades: [
      { skill: "Ginga", value: 92 },
      { skill: "Golpes", value: 61 },
      { skill: "Esquivas", value: 69 },
      { skill: "Ritmo", value: 76 },
      { skill: "Roda", value: 88 },
      { skill: "Malícia", value: 90 },
    ],
    destaques: ["Boa participação na roda", "Evolução constante na ginga"],
    focos: ["Fortalecer golpes básicos", "Ganhar confiança nas esquivas"],
  },
  juvenil: {
    periodo: "1º semestre 2026",
    data: "15/06/2026",
    professor: "Professor responsável",
    habilidades: [
      { skill: "Ginga", value: 88 },
      { skill: "Golpes", value: 73 },
      { skill: "Esquivas", value: 78 },
      { skill: "Ritmo", value: 81 },
      { skill: "Roda", value: 84 },
      { skill: "Malícia", value: 75 },
    ],
    destaques: ["Boa leitura do jogo", "Participação consistente nas aulas"],
    focos: ["Refinar fluidez dos golpes", "Ampliar repertório de esquivas"],
  },
  adulto: {
    periodo: "1º semestre 2026",
    data: "15/06/2026",
    professor: "Professor responsável",
    habilidades: [
      { skill: "Ginga", value: 85 },
      { skill: "Golpes", value: 80 },
      { skill: "Esquivas", value: 83 },
      { skill: "Ritmo", value: 74 },
      { skill: "Roda", value: 89 },
      { skill: "Malícia", value: 82 },
    ],
    destaques: ["Presença firme na roda", "Bom domínio técnico geral"],
    focos: ["Ajustar ritmo em sequências", "Ganhar mais leitura estratégica"],
  },
};

function inferirPerfil(aluno) {
  const categoria = `${aluno?.categoria_nome || ""}`.toLowerCase();

  if (categoria.includes("infantil")) return "infantil";
  if (categoria.includes("juvenil")) return "juvenil";
  return "adulto";
}

function montarComentario(aluno, habilidades) {
  const ordenadas = [...habilidades].sort((a, b) => b.value - a.value);
  const fortes = ordenadas.slice(0, 2);
  const focos = [...ordenadas].reverse().slice(0, 2);

  return `${aluno?.nome || "O aluno"} tem bom destaque em ${fortes[0].skill.toLowerCase()} (${fortes[0].value}) e ${fortes[1].skill.toLowerCase()} (${fortes[1].value}). No momento, o foco está em ${focos[0].skill.toLowerCase()} (${focos[0].value}) e ${focos[1].skill.toLowerCase()} (${focos[1].value}), mantendo uma evolução gradual e positiva ao longo do semestre.`;
}

export default function FamiliaAvaliacaoMock({ alunos = [] }) {
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState(alunos[0]?.id ?? null);
  const [relatorioAberto, setRelatorioAberto] = useState(false);
  const { usuario } = useFamilyAuth();

  const alunoSelecionado = useMemo(() => {
    return alunos.find((aluno) => aluno.id === alunoSelecionadoId) || alunos[0] || null;
  }, [alunoSelecionadoId, alunos]);

  const avaliacao = useMemo(() => {
    if (!alunoSelecionado) return null;

    const perfil = inferirPerfil(alunoSelecionado);
    const base = AVALIACOES_BASE[perfil];

    return {
      ...base,
      comentario: montarComentario(alunoSelecionado, base.habilidades),
    };
  }, [alunoSelecionado]);

  if (!alunoSelecionado || !avaliacao) return null;

  const nomeBase = alunoSelecionado.apelido || alunoSelecionado.nome || "Aluno";
  const iniciais = nomeBase
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  return (
    <section className="rounded-[28px] border border-stone-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)]">
      <div className="border-b border-stone-200 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              Avaliação semestral
            </p>
            <h2 className="mt-1 text-lg font-black text-slate-900">
              Desenvolvimento do aluno
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Leitura visual simples do semestre, com foco em evolução.
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

      <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="rounded-[24px] border border-stone-200 bg-[linear-gradient(180deg,#fffef9_0%,#ffffff_100%)] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-amber-100 text-base font-black text-amber-700">
              {alunoSelecionado.foto_url ? (
                <img
                  src={alunoSelecionado.foto_url}
                  alt={alunoSelecionado.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                iniciais || "A"
              )}
            </div>
            <div className="min-w-0">
              {alunoSelecionado.apelido ? (
                <>
                  <h3 className="truncate text-base font-black text-slate-900">
                    {alunoSelecionado.apelido}
                  </h3>
                  <p className="truncate text-sm italic text-stone-500">
                    {alunoSelecionado.nome}
                  </p>
                </>
              ) : (
                <h3 className="truncate text-base font-black text-slate-900">
                  {alunoSelecionado.nome}
                </h3>
              )}
              <p className="text-sm text-stone-500">
                {alunoSelecionado.turma_nome || alunoSelecionado.categoria_nome || "Turma não informada"}
              </p>
            </div>
          </div>

          <div className="mt-4 aspect-square max-w-md">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="76%" data={avaliacao.habilidades}>
                <PolarGrid stroke="#e7e5e4" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: "#57534e", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#a8a29e", fontSize: 10 }}
                />
                <Radar
                  dataKey="value"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Comentário do professor
                </p>
                <p className="mt-1 text-sm text-stone-500">{avaliacao.periodo}</p>
              </div>
              <p className="text-xs text-stone-400">{avaliacao.data}</p>
            </div>

            <p className="mt-3 text-sm leading-6 text-stone-700">
              {avaliacao.comentario}
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-stone-400">{avaliacao.professor}</p>
              <button
                type="button"
                onClick={() => setRelatorioAberto(true)}
                className="text-xs font-semibold text-slate-700 transition hover:text-slate-900"
              >
                Expandir relatório
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Destaques
              </p>
              <div className="mt-2 space-y-1.5">
                {avaliacao.destaques.map((item) => (
                  <p key={item} className="text-sm font-medium text-emerald-800">
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                Foco atual
              </p>
              <div className="mt-2 space-y-1.5">
                {avaliacao.focos.map((item) => (
                  <p key={item} className="text-sm font-medium text-amber-800">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatorioAberto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 sm:p-6">
          <div className="relative max-h-[92vh] w-full max-w-[860px] overflow-y-auto rounded-[28px] bg-[#f6f3ee] shadow-2xl">
            <button
              type="button"
              onClick={() => setRelatorioAberto(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 bg-white text-slate-600 transition hover:bg-stone-50"
              aria-label="Fechar relatório"
            >
              <X size={16} />
            </button>

            <div className="mx-auto my-6 w-[min(100%,794px)] rounded-[20px] border border-stone-300 bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="border-b border-stone-300 pb-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-stone-50 text-lg font-black text-slate-700">
                    CN
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                      Relatório pedagógico
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-900">
                      {usuario?.organizacao_nome || "Capoeira Base"}
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      Avaliação formativa semestral do aluno
                    </p>
                  </div>
                  <div className="text-right text-xs text-stone-500">
                    <p>{avaliacao.periodo}</p>
                    <p className="mt-1">{avaliacao.data}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="rounded-[18px] border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-amber-100 text-lg font-black text-amber-700">
                      {alunoSelecionado.foto_url ? (
                        <img
                          src={alunoSelecionado.foto_url}
                          alt={alunoSelecionado.nome}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        iniciais || "A"
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        Aluno
                      </p>
                      <p className="truncate text-base font-black text-slate-900">
                        {alunoSelecionado.apelido || alunoSelecionado.nome}
                      </p>
                      {alunoSelecionado.apelido ? (
                        <p className="truncate text-sm italic text-stone-500">
                          {alunoSelecionado.nome}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        Turma
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {alunoSelecionado.turma_nome || "Não informada"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        Categoria
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {alunoSelecionado.categoria_nome || "Não informada"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                        Graduação
                      </p>
                      <p className="mt-1 font-medium text-slate-800">
                        {alunoSelecionado.graduacao_nome || "Não informada"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {avaliacao.habilidades.map((item) => (
                      <div
                        key={item.skill}
                        className="rounded-[16px] border border-stone-200 px-3 py-3"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                          {item.skill}
                        </p>
                        <p className="mt-1 text-lg font-black text-slate-900">
                          {item.value}/100
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[18px] border border-stone-200 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                      Parecer descritivo do professor
                    </p>
                    <p className="mt-3 text-sm leading-7 text-stone-700">
                      {avaliacao.comentario}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                        Destaques observados
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {avaliacao.destaques.map((item) => (
                          <p key={item} className="text-sm text-emerald-900">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                        Pontos de acompanhamento
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {avaliacao.focos.map((item) => (
                          <p key={item} className="text-sm text-amber-900">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 border-t border-stone-300 pt-8 sm:grid-cols-2">
                <div>
                  <div className="h-px bg-stone-300" />
                  <p className="mt-2 text-xs text-stone-500">
                    Responsável pelo aluno
                  </p>
                </div>
                <div>
                  <div className="h-px bg-stone-300" />
                  <p className="mt-2 text-xs text-stone-500">
                    {avaliacao.professor}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

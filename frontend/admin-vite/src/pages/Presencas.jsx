// src/pages/Presencas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { listarAlunos } from "../services/alunoService";
import { salvarBatch, listarPorTurmaEData } from "../services/presencaService";
import { listarTurmas, getMinhasTurmas } from "../services/turmaService";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Presencas() {
  const query = useQuery();
  const navigate = useNavigate();

  const turmaId = query.get("turma"); // /presencas?turma=4
  const turmaIdNum = turmaId ? Number(turmaId) : null;

  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [alunosTurma, setAlunosTurma] = useState([]); // [{id, nome, apelido, turma_id}]
  const [itens, setItens] = useState([]); // [{ aluno_id, status }]

  // Turmas para as quais o usuário é responsável (instrutor OU admin com turma)
  const [minhasTurmas, setMinhasTurmas] = useState([]); // [{id, nome?}]
  // Todas as turmas (para resolver nome pelo id, se necessário)
  const [todasTurmas, setTodasTurmas] = useState([]); // [{id, nome}]
  const [descobrindoTurma, setDescobrindoTurma] = useState(true);

  // ---- Carregar turmas (minhas + todas) ----
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        setDescobrindoTurma(true);
        const [minhas, todas] = await Promise.all([
          getMinhasTurmas().catch(() => []),
          listarTurmas().catch(() => []),
        ]);
        if (!ativo) return;
        setMinhasTurmas(Array.isArray(minhas) ? minhas : []);
        setTodasTurmas(Array.isArray(todas) ? todas : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (ativo) setDescobrindoTurma(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  // Mapa id->nome para resolver nome da turma
  const nomeDaTurma = useMemo(() => {
    const map = new Map();
    [...todasTurmas, ...minhasTurmas].forEach((t) => {
      if (t && typeof t.id !== "undefined") {
        map.set(Number(t.id), t.nome || map.get(Number(t.id)));
      }
    });
    return (id) => map.get(Number(id)) || null;
  }, [todasTurmas, minhasTurmas]);

  // Se não veio ?turma, autodetecta:
  // - Se houver 1 única turma responsável, redireciona direto
  // - Se houver mais de uma, mostra seletor
  useEffect(() => {
    if (turmaIdNum || descobrindoTurma) return;
    const idsPermitidos = (minhasTurmas || []).map((t) => Number(t.id));
    if (idsPermitidos.length === 1) {
      navigate(`/presencas?turma=${idsPermitidos[0]}`, { replace: true });
    }
  }, [turmaIdNum, minhasTurmas, descobrindoTurma, navigate]);

  // Verificação de permissão: só permite chamar turmas das quais o usuário é responsável
  const idsPermitidos = useMemo(
    () => new Set((minhasTurmas || []).map((t) => Number(t.id))),
    [minhasTurmas]
  );
  const turmaPermitida = turmaIdNum ? idsPermitidos.has(turmaIdNum) : false;

  // ---- Carregar alunos da turma + presenças do dia ----
  useEffect(() => {
    let ativo = true;
    async function carregar() {
      if (!turmaIdNum || !turmaPermitida) return;
      try {
        setCarregando(true);

        // 1) Busca direto só os alunos dessa turma (o backend já filtra usando matrícula ativa)
        const somenteTurma = await listarAlunos(turmaIdNum);

        if (!ativo) return;
        setAlunosTurma(somenteTurma);

        // 2) Presenças do dia (se houver)
        const resp = await listarPorTurmaEData(turmaIdNum, data);
        const marcados = (resp?.presencas || []).reduce((acc, p) => {
          acc.set(
            Number(p.aluno_id),
            p.status === "presente" ? "presente" : "falta"
          );
          return acc;
        }, new Map());

        // 3) Base de itens: default "falta", sobrescreve com marcados
        const base = somenteTurma.map((a) => ({
          aluno_id: a.id,
          status: marcados.get(a.id) || "falta",
        }));
        if (!ativo) return;
        setItens(base);
      } catch (e) {
        console.error(e);
        alert(e?.response?.data?.erro || "Falha ao carregar dados de chamada.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, [turmaIdNum, turmaPermitida, data]);

  const mapaStatus = useMemo(() => {
    const m = new Map();
    itens.forEach((i) => m.set(i.aluno_id, i.status));
    return m;
  }, [itens]);

  function setStatusAluno(alunoId, novoStatus) {
    setItens((prev) =>
      prev.map((i) =>
        i.aluno_id === alunoId ? { ...i, status: novoStatus } : i
      )
    );
  }

  function marcarTodos(novoStatus) {
    setItens((prev) => prev.map((i) => ({ ...i, status: novoStatus })));
  }

  async function handleSalvar() {
    if (!turmaIdNum || !turmaPermitida) return;
    if (!itens.length) {
      alert("Não há alunos nesta turma.");
      return;
    }
    try {
      setSalvando(true);
      await salvarBatch({
        turma_id: turmaIdNum,
        data,
        itens, // [{ aluno_id, status }]
      });
      alert("Presenças salvas com sucesso!");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.erro || "Falha ao salvar presenças.");
    } finally {
      setSalvando(false);
    }
  }

  // ---- UI ----
  const tituloTurma =
    turmaIdNum && turmaPermitida
      ? nomeDaTurma(turmaIdNum) || `Turma #${turmaIdNum}`
      : turmaIdNum && !turmaPermitida
      ? "Sem permissão para esta turma"
      : "Selecione a turma";

  return (
    <div className="space-y-4 pb-28">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-cor-fundo/80 backdrop-blur-sm py-3">
        <div className="flex items-center gap-3 px-2">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-lg border border-cor-secundaria/30 flex items-center justify-center"
            aria-label="Voltar"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="text-sm text-cor-texto/70">Chamada</div>
            <div className="text-base font-semibold text-cor-titulo">
              {tituloTurma}
            </div>
          </div>
          <input
            type="date"
            className="h-9 rounded-lg border border-cor-secundaria/30 px-2 text-sm bg-transparent"
            value={data}
            onChange={(e) => setData(e.target.value)}
            aria-label="Selecionar data"
          />
        </div>
      </div>

      {/* Seletor de turma quando não vier ?turma=ID */}
      {!turmaIdNum && (
        <div className="mx-2 rounded-xl border border-cor-secundaria/20">
          <div className="p-4">
            <div className="text-sm font-semibold text-cor-titulo">
              Selecione a turma
            </div>
            <p className="text-xs text-cor-texto/70 mt-1">
              Toque na turma para abrir a chamada de hoje.
            </p>

            {descobrindoTurma && (
              <p className="text-xs text-cor-texto/60 mt-3">
                Carregando turmas…
              </p>
            )}

            {!descobrindoTurma && minhasTurmas.length === 0 && (
              <div className="mt-3 text-xs">
                Você não é responsável por nenhuma turma.
              </div>
            )}

            {!descobrindoTurma && minhasTurmas.length > 0 && (
              <ul className="mt-3 divide-y divide-cor-secundaria/10">
                {minhasTurmas.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => navigate(`/presencas?turma=${t.id}`)}
                      className="w-full text-left px-3 py-3 text-sm flex items-center justify-between active:scale-[0.99]"
                    >
                      <span className="font-medium text-cor-titulo">
                        {t.nome || `Turma #${t.id}`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Aviso de permissão quando veio turma mas não é responsável */}
      {turmaIdNum && !turmaPermitida && (
        <div className="mx-2 rounded-xl border-2 border-dashed border-red-400/50 p-4 text-red-400">
          <div className="text-sm font-semibold">Acesso restrito</div>
          <p className="text-xs opacity-80 mt-1">
            Você não é responsável por esta turma.
          </p>
        </div>
      )}

      {/* Ações rápidas */}
      <div className="mx-2 grid grid-cols-2 gap-2">
        <button
          disabled={
            !turmaIdNum ||
            !turmaPermitida ||
            carregando ||
            alunosTurma.length === 0
          }
          onClick={() => marcarTodos("presente")}
          className={`rounded-xl border px-3 py-3 text-sm ${
            turmaIdNum && turmaPermitida && !carregando && alunosTurma.length
              ? "border-cor-secundaria/30 active:scale-[0.99]"
              : "border-cor-secundaria/10 opacity-60"
          }`}
        >
          Marcar todos presentes
        </button>

        <button
          disabled={
            !turmaIdNum ||
            !turmaPermitida ||
            carregando ||
            alunosTurma.length === 0
          }
          onClick={() => marcarTodos("falta")}
          className={`rounded-xl border px-3 py-3 text-sm ${
            turmaIdNum && turmaPermitida && !carregando && alunosTurma.length
              ? "border-cor-secundaria/30 active:scale-[0.99]"
              : "border-cor-secundaria/10 opacity-60"
          }`}
        >
          Marcar todos falta
        </button>
      </div>

      {/* Lista de alunos com toggles grandes */}
      <div className="mx-2 rounded-xl border border-cor-secundaria/20">
        <div className="p-4 text-sm font-semibold text-cor-titulo">
          Lista de alunos
        </div>

        {carregando && (
          <p className="px-4 pb-4 text-xs text-cor-texto/60">Carregando…</p>
        )}

        {!carregando &&
          turmaIdNum &&
          turmaPermitida &&
          alunosTurma.length === 0 && (
            <p className="px-4 pb-4 text-xs text-cor-texto/70">
              Nenhum aluno vinculado a esta turma.
            </p>
          )}

        <ul className="divide-y divide-cor-secundaria/10">
          {alunosTurma.map((aluno) => {
            const status = mapaStatus.get(aluno.id) || "falta";
            const presente = status === "presente";
            return (
              <li
                key={aluno.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-cor-titulo truncate">
                    {aluno.nome}
                  </div>
                  {aluno.apelido && (
                    <div className="text-[11px] text-cor-texto/60">
                      ({aluno.apelido})
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusAluno(aluno.id, "falta")}
                    className={`px-3 py-2 rounded-lg border text-xs ${
                      !presente
                        ? "bg-red-500 text-white border-red-500"
                        : "border-cor-secundaria/30 text-cor-texto/80"
                    }`}
                    aria-pressed={!presente}
                    aria-label={`Marcar ${aluno.nome} como falta`}
                  >
                    Falta
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusAluno(aluno.id, "presente")}
                    className={`px-3 py-2 rounded-lg border text-xs ${
                      presente
                        ? "bg-green-600 text-white border-green-600"
                        : "border-cor-secundaria/30 text-cor-texto/80"
                    }`}
                    aria-pressed={presente}
                    aria-label={`Marcar ${aluno.nome} como presente`}
                  >
                    Presente
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Botão fixo de salvar */}
      <div className="fixed inset-x-4 bottom-5 z-50">
        <button
          disabled={
            !turmaIdNum || !turmaPermitida || salvando || itens.length === 0
          }
          onClick={handleSalvar}
          className={`w-full rounded-2xl px-5 py-3 text-white shadow-xl flex items-center justify-center gap-2 ${
            !turmaIdNum || !turmaPermitida || salvando || itens.length === 0
              ? "bg-cor-secundaria/40"
              : "bg-cor-primaria active:scale-[0.98]"
          }`}
          aria-label="Salvar presenças"
        >
          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          {salvando ? "Salvando..." : "Salvar presenças"}
        </button>
      </div>
    </div>
  );
}

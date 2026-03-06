import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { exportarRelatorioFaltasCronicasPDF } from "../../utils/relatorioAlunosAvancadoPDF";

function periodoAnoAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  return {
    inicio: `${ano}-01-01`,
    fim: formatarDataLocalISO(hoje),
  };
}

function periodoMesAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;
  return {
    inicio: `${ano}-${String(mes).padStart(2, "0")}-01`,
    fim: formatarDataLocalISO(hoje),
  };
}

function formatarDataLocalISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function ModalRelatorioFaltasCronicas({
  aberto,
  onClose,
  alunos,
  turmas,
  turmaSelecionada,
  onTrocarTurma,
}) {
  const [tipoPeriodo, setTipoPeriodo] = useState("ano");
  const [inicio, setInicio] = useState(periodoAnoAtual().inicio);
  const [fim, setFim] = useState(periodoAnoAtual().fim);
  const [minimoFaltas, setMinimoFaltas] = useState(3);
  const [metricas, setMetricas] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    function atualizarViewport() {
      setIsMobile(window.innerWidth <= 768);
    }
    atualizarViewport();
    window.addEventListener("resize", atualizarViewport);
    return () => window.removeEventListener("resize", atualizarViewport);
  }, []);

  const alunosFiltrados = useMemo(() => {
    if (!Array.isArray(alunos)) return [];
    if (!turmaSelecionada || turmaSelecionada === "todos") return alunos;
    if (turmaSelecionada === "sem_turma") {
      return alunos.filter((a) => a.turma_id == null);
    }
    return alunos.filter((a) => String(a.turma_id) === String(turmaSelecionada));
  }, [alunos, turmaSelecionada]);

  const linhasComMetricas = useMemo(() => {
    return alunosFiltrados
      .map((aluno) => {
        const m = metricas?.[aluno.id] || {};
        const taxa = Number(m.taxa_presenca || 0);
        return {
          id: aluno.id,
          nome: aluno.apelido ? `${aluno.apelido} - ${aluno.nome}` : aluno.nome,
          turma: aluno.turma || "-",
          categoria: aluno.categoria_nome || "-",
          presentes: Number(m.presentes || 0),
          faltas: Number(m.faltas || 0),
          total: Number(m.total || 0),
          frequencia: Math.round(taxa * 100),
        };
      })
      .sort((a, b) => b.faltas - a.faltas || a.nome.localeCompare(b.nome, "pt-BR"));
  }, [alunosFiltrados, metricas]);

  const cronicos = useMemo(() => {
    return linhasComMetricas.filter((item) => item.faltas >= Number(minimoFaltas || 0));
  }, [linhasComMetricas, minimoFaltas]);

  useEffect(() => {
    if (!aberto) return;
    if (!turmaSelecionada) onTrocarTurma("todos");
  }, [aberto, turmaSelecionada, onTrocarTurma]);

  useEffect(() => {
    if (tipoPeriodo === "ano") {
      const novo = periodoAnoAtual();
      setInicio(novo.inicio);
      setFim(novo.fim);
      return;
    }
    if (tipoPeriodo === "mes") {
      const novo = periodoMesAtual();
      setInicio(novo.inicio);
      setFim(novo.fim);
    }
  }, [tipoPeriodo]);

  useEffect(() => {
    async function carregarMetricasLote() {
      if (!aberto || !alunosFiltrados.length || !inicio || !fim) {
        setMetricas({});
        return;
      }

      try {
        setCarregando(true);
        const ids = alunosFiltrados.map((a) => a.id);
        const { data } = await api.post("/alunos/metricas/lote", {
          ids,
          inicio,
          fim,
        });
        setMetricas(data || {});
      } catch {
        setMetricas({});
      } finally {
        setCarregando(false);
      }
    }

    carregarMetricasLote();
  }, [aberto, alunosFiltrados, inicio, fim]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2">
      <div
        className={`bg-white rounded-lg shadow-xl relative overflow-hidden ${
          isMobile ? "w-full h-full" : "w-full max-w-[920px] max-h-[95vh]"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 text-2xl z-10"
        >
          ✕
        </button>

        <div className="p-4 sm:p-6 overflow-y-auto h-full">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-4">
            Relatório de Faltas Crônicas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-sm font-medium text-black">Turma:</label>
              <select
                className="w-full p-2 border rounded-md bg-white text-black mt-1"
                value={turmaSelecionada || "todos"}
                onChange={(e) => onTrocarTurma(e.target.value)}
              >
                <option value="todos">Todas as turmas</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-black">Período:</label>
              <select
                className="w-full p-2 border rounded-md bg-white text-black mt-1"
                value={tipoPeriodo}
                onChange={(e) => setTipoPeriodo(e.target.value)}
              >
                <option value="ano">Ano atual</option>
                <option value="mes">Mês atual</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-black">
                Mínimo de faltas:
              </label>
              <input
                type="number"
                min={1}
                className="w-full p-2 border rounded-md bg-white text-black mt-1"
                value={minimoFaltas}
                onChange={(e) => setMinimoFaltas(Number(e.target.value || 1))}
              />
            </div>
          </div>

          {tipoPeriodo === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
              <input
                type="date"
                className="p-2 border rounded-md text-black"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
              <input
                type="date"
                className="p-2 border rounded-md text-black"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>
          )}

          <div className="mb-3 text-sm text-gray-700">
            {cronicos.length} aluno(s) com {minimoFaltas}+ faltas no período selecionado.
          </div>

          <div className="border rounded-lg overflow-hidden">
            {carregando ? (
              <div className="p-5 text-sm text-gray-600">Carregando dados...</div>
            ) : cronicos.length === 0 ? (
              <div className="p-5 text-sm text-gray-600">
                Nenhum aluno encontrado nesse critério.
              </div>
            ) : (
              <>
                {isMobile ? (
                  <div className="max-h-[52vh] overflow-auto p-2 space-y-2">
                    {cronicos.map((item, index) => (
                      <div key={item.id} className="rounded-md border border-gray-200 bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-gray-600">#{index + 1}</p>
                          <p className="text-xs font-semibold text-red-700">{item.faltas} faltas</p>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-black">{item.nome}</p>
                        <p className="text-xs text-gray-700">
                          Turma: <span className="font-medium">{item.turma}</span>
                        </p>
                        <p className="text-xs text-gray-700">
                          Categoria: <span className="font-medium">{item.categoria}</span>
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          <div className="rounded border border-gray-200 p-2 text-center">
                            <p className="text-gray-500">Presentes</p>
                            <p className="font-semibold text-black">{item.presentes}</p>
                          </div>
                          <div className="rounded border border-red-200 bg-red-50 p-2 text-center">
                            <p className="text-red-600">Faltas</p>
                            <p className="font-semibold text-red-700">{item.faltas}</p>
                          </div>
                          <div className="rounded border border-gray-200 p-2 text-center">
                            <p className="text-gray-500">Frequência</p>
                            <p className="font-semibold text-black">{item.frequencia}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[52vh]">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="p-2 border text-black">#</th>
                          <th className="p-2 border text-black">Aluno</th>
                          <th className="p-2 border text-black">Turma</th>
                          <th className="p-2 border text-black">Categoria</th>
                          <th className="p-2 border text-black">Presentes</th>
                          <th className="p-2 border text-black">Faltas</th>
                          <th className="p-2 border text-black">Frequência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cronicos.map((item, index) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="p-2 border text-center text-black">{index + 1}</td>
                            <td className="p-2 border text-black">{item.nome}</td>
                            <td className="p-2 border text-black">{item.turma}</td>
                            <td className="p-2 border text-black">{item.categoria}</td>
                            <td className="p-2 border text-center text-black">
                              {item.presentes}
                            </td>
                            <td className="p-2 border text-center text-red-700 font-semibold">
                              {item.faltas}
                            </td>
                            <td className="p-2 border text-center text-black">
                              {item.frequencia}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={!cronicos.length}
              onClick={() =>
                exportarRelatorioFaltasCronicasPDF({
                  linhas: cronicos,
                  inicio,
                  fim,
                  minimoFaltas,
                })
              }
              className="bg-cor-primaria hover:bg-cor-destaque text-black px-4 py-2 rounded-md font-medium disabled:opacity-50"
            >
              Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

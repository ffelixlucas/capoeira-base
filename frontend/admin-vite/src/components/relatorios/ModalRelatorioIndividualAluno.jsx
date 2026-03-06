import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { exportarRelatorioIndividualAlunoPDF } from "../../utils/relatorioAlunosAvancadoPDF";
import InfoTip from "../ui/InfoTip";

function periodoPadrao() {
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

export default function ModalRelatorioIndividualAluno({
  aberto,
  onClose,
  alunos,
  turmas,
  turmaSelecionada,
  onTrocarTurma,
}) {
  const [tipoPeriodo, setTipoPeriodo] = useState("ano");
  const [inicio, setInicio] = useState(periodoPadrao().inicio);
  const [fim, setFim] = useState(periodoPadrao().fim);
  const [alunoId, setAlunoId] = useState("");
  const [metricas, setMetricas] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const isMobile = window.innerWidth <= 768;

  const alunosFiltrados = useMemo(() => {
    if (!Array.isArray(alunos)) return [];
    if (!turmaSelecionada || turmaSelecionada === "todos") return alunos;
    if (turmaSelecionada === "sem_turma") {
      return alunos.filter((a) => a.turma_id == null);
    }
    return alunos.filter((a) => String(a.turma_id) === String(turmaSelecionada));
  }, [alunos, turmaSelecionada]);

  const alunoSelecionado = useMemo(() => {
    return alunosFiltrados.find((a) => String(a.id) === String(alunoId)) || null;
  }, [alunosFiltrados, alunoId]);

  useEffect(() => {
    if (!aberto) return;
    if (!turmaSelecionada) onTrocarTurma("todos");
  }, [aberto, turmaSelecionada, onTrocarTurma]);

  useEffect(() => {
    if (!aberto) return;
    if (!alunosFiltrados.length) {
      setAlunoId("");
      setMetricas(null);
      return;
    }
    if (!alunoId || !alunosFiltrados.some((a) => String(a.id) === String(alunoId))) {
      setAlunoId(String(alunosFiltrados[0].id));
    }
  }, [aberto, alunosFiltrados, alunoId]);

  useEffect(() => {
    if (tipoPeriodo === "ano") {
      const novo = periodoPadrao();
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
    async function carregarMetricas() {
      if (!aberto || !alunoId || !inicio || !fim) return;
      try {
        setCarregando(true);
        const { data } = await api.get(`/alunos/${alunoId}/metricas`, {
          params: { inicio, fim },
        });
        setMetricas(data || null);
      } catch {
        setMetricas(null);
      } finally {
        setCarregando(false);
      }
    }
    carregarMetricas();
  }, [aberto, alunoId, inicio, fim]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2">
      <div
        className={`bg-white rounded-lg shadow-xl relative overflow-hidden ${
          isMobile ? "w-full h-full" : "w-full max-w-[760px] max-h-[95vh]"
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
            Relatório Individual do Aluno
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
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
              <label className="text-sm font-medium text-black">Aluno:</label>
              <select
                className="w-full p-2 border rounded-md bg-white text-black mt-1"
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
              >
                {!alunosFiltrados.length && <option value="">Nenhum aluno disponível</option>}
                {alunosFiltrados.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.apelido ? `${a.apelido} - ${a.nome}` : a.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-black block mb-1">Período:</label>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={() => setTipoPeriodo("ano")}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  tipoPeriodo === "ano"
                    ? "bg-blue-100 border border-blue-300 text-black"
                    : "bg-gray-100 text-black"
                }`}
              >
                Ano atual
              </button>
              <button
                onClick={() => setTipoPeriodo("mes")}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  tipoPeriodo === "mes"
                    ? "bg-blue-100 border border-blue-300 text-black"
                    : "bg-gray-100 text-black"
                }`}
              >
                Mês atual
              </button>
              <button
                onClick={() => setTipoPeriodo("custom")}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  tipoPeriodo === "custom"
                    ? "bg-blue-100 border border-blue-300 text-black"
                    : "bg-gray-100 text-black"
                }`}
              >
                Personalizado
              </button>
            </div>

            {tipoPeriodo === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-base font-semibold text-black mb-3">Resumo do aluno</h3>

            {!carregando &&
              alunoSelecionado &&
              metricas &&
              Number(metricas.total || 0) === 0 && (
                <InfoTip type="error" className="mb-3 !py-2 !px-3 text-xs">
                  Sem chamadas registradas para este aluno no período selecionado.
                </InfoTip>
              )}

            {!alunoSelecionado && (
              <p className="text-sm text-gray-600">Selecione um aluno para visualizar.</p>
            )}

            {alunoSelecionado && (
              <>
                <p className="text-sm text-black">
                  <span className="font-semibold">Aluno:</span> {alunoSelecionado.nome}
                </p>
                <p className="text-sm text-black">
                  <span className="font-semibold">Turma:</span>{" "}
                  {alunoSelecionado.turma || "-"}
                </p>
                <p className="text-sm text-black mb-3">
                  <span className="font-semibold">Categoria:</span>{" "}
                  {alunoSelecionado.categoria_nome || "-"}
                </p>

                {carregando && (
                  <p className="text-sm text-gray-600">Carregando métricas...</p>
                )}

                {!carregando && metricas && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="border rounded-md p-2 bg-white">
                      <p className="text-xs text-gray-500">Presentes</p>
                      <p className="text-lg font-bold text-green-700">
                        {Number(metricas.presentes || 0)}
                      </p>
                    </div>
                    <div className="border rounded-md p-2 bg-white">
                      <p className="text-xs text-gray-500">Faltas</p>
                      <p className="text-lg font-bold text-red-700">
                        {Number(metricas.faltas || 0)}
                      </p>
                    </div>
                    <div className="border rounded-md p-2 bg-white">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Number(metricas.total || 0)}
                      </p>
                    </div>
                    <div className="border rounded-md p-2 bg-white">
                      <p className="text-xs text-gray-500">Frequência</p>
                      <p className="text-lg font-bold text-blue-700">
                        {Math.round(Number(metricas.taxa_presenca || 0) * 100)}%
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={!alunoSelecionado || !metricas}
              onClick={() =>
                exportarRelatorioIndividualAlunoPDF({
                  aluno: alunoSelecionado,
                  metricas,
                  inicio,
                  fim,
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

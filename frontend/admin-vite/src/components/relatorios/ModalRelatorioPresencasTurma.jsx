import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { logger } from "../../utils/logger";
import { exportarRelatorioPresencasPDF } from "../../utils/relatorioPresencasPDF";

export default function ModalRelatorioPresencasTurma({
  aberto,
  onClose,
  alunos,
  turmas,
  turmaSelecionada,
  onTrocarTurma,
}) {
  if (!aberto) return null;

  // LOG INICIAL
  logger.log("[ModalPresenca] Modal aberto:", aberto);
  logger.log("[ModalPresenca] Turma selecionada inicial:", turmaSelecionada);
  logger.log("[ModalPresenca] Total de alunos recebidos:", alunos.length);

  const isMobile = window.innerWidth <= 768;

  // 🔥 PERÍODO — padrão = Ano atual
  const [tipoPeriodo, setTipoPeriodo] = useState("ano");
  const anoAtual = new Date().getFullYear();
  const hoje = new Date().toISOString().slice(0, 10);

  const [inicio, setInicio] = useState(`${anoAtual}-01-01`);
  const [fim, setFim] = useState(hoje);

  // ⚠️ Garantir que sempre abra com TODAS as turmas
  useEffect(() => {
    if (!turmaSelecionada) {
      logger.log("[ModalPresenca] Ajustando turma inicial → 'todos'");
      onTrocarTurma("todos");
    }
  }, [turmaSelecionada]);

  // 🔥 Atualiza automaticamente o período quando troca opção
  useEffect(() => {
    logger.log("[ModalPresenca] Tipo período alterado:", tipoPeriodo);

    if (tipoPeriodo === "ano") {
      const ano = new Date().getFullYear();
      setInicio(`${ano}-01-01`);
      setFim(new Date().toISOString().slice(0, 10));

      logger.log("[ModalPresenca] Período → Ano atual:", `${ano}-01-01`, hoje);
    }

    if (tipoPeriodo === "mes") {
      const agora = new Date();
      const ano = agora.getFullYear();
      const mes = agora.getMonth() + 1;

      const primeiro = `${ano}-${String(mes).padStart(2, "0")}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const ultimo = `${ano}-${String(mes).padStart(2, "0")}-${ultimoDia}`;

      setInicio(primeiro);
      setFim(ultimo);

      logger.log("[ModalPresenca] Período → Mês atual:", primeiro, ultimo);
    }

    if (tipoPeriodo === "custom") {
      logger.log("[ModalPresenca] Período → Customizado");
    }
  }, [tipoPeriodo]);

  // Métricas
  const [metricas, setMetricas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // Carregar métricas ao trocar turma ou período
  useEffect(() => {
    if (!turmaSelecionada) {
      logger.log("[ModalPresenca] Turma não definida, abortando load.");
      return;
    }

    if (alunos.length === 0) {
      logger.log("[ModalPresenca] Nenhum aluno nessa turma.");
      return;
    }

    logger.log("[ModalPresenca] Disparando carga de métricas:", {
      turmaSelecionada,
      inicio,
      fim,
    });

    carregarMetricas();
  }, [turmaSelecionada, inicio, fim]);

  async function carregarMetricas() {
    try {
      setCarregando(true);
      logger.log("[ModalPresenca] Carregando métricas...");

      const metricasCalculadas = await Promise.all(
        alunos.map(async (aluno) => {
          const { data } = await api.get(`/alunos/${aluno.id}/metricas`, {
            params: { inicio, fim },
          });

          // 🔥 CORREÇÃO: Garantir que os dados venham no formato correto
          logger.log(`[ModalPresenca] Métricas do aluno ${aluno.id}:`, data);

          return { 
            ...aluno, 
            metricas: {
              presentes: data.presentes || 0,
              faltas: data.faltas || 0,
              total: data.total || 0,
              // 🔥 Cálculo seguro do percentual
              percentual: data.total > 0 
                ? Math.round(((data.presentes || 0) / data.total) * 100)
                : 0
            }
          };
        })
      );

      logger.log("[ModalPresenca] Métricas carregadas:", metricasCalculadas);
      setMetricas(metricasCalculadas);
    } catch (e) {
      logger.error("[ModalPresenca] ERRO ao carregar métricas:", e);
      // 🔥 CORREÇÃO: Em caso de erro, limpar métricas
      setMetricas([]);
    } finally {
      setCarregando(false);
    }
  }

  // ------------------ Funções de formatação ------------------

  function capitalizarFrase(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }
  
  function formatarNome(a) {
    const nome = capitalizarFrase(a.nome);
    const apelido = a.apelido ? capitalizarFrase(a.apelido) : null;

    if (apelido) {
      return `${apelido} – ${nome}`;
    }

    return nome;
  }

  // 🔥 FUNÇÃO MELHORADA PARA CALCULAR PERCENTUAL
  function calcularPercentual(presentes, total) {
    if (total === 0) return 0;
    const percent = (presentes / total) * 100;
    return Math.round(percent * 10) / 10; // Arredonda para 1 casa decimal
  }

  function corPercentual(p) {
    if (p >= 75) return "text-green-700 font-bold";
    if (p >= 50) return "text-yellow-700 font-bold";
    return "text-red-700 font-bold";
  }

  // ------------------ Exportar PDF ------------------

  function handleExportarPDF() {
    logger.log("[ModalPresenca] Exportando PDF…", { inicio, fim, metricas });

    // 🔥 CORREÇÃO: Garantir que as métricas estejam formatadas corretamente para o PDF
    const metricasFormatadas = metricas.map(aluno => ({
      ...aluno,
      metricas: {
        ...aluno.metricas,
        percentual: calcularPercentual(
          aluno.metricas.presentes || 0, 
          aluno.metricas.total || 0
        )
      }
    }));

    exportarRelatorioPresencasPDF({
      turmaNome:
        turmaSelecionada === "todos"
          ? "Todas as turmas"
          : turmas.find((t) => t.id == turmaSelecionada)?.nome,
      inicio,
      fim,
      metricas: metricasFormatadas,
    });
  }

  // ------------------ VERSÃO MOBILE OTIMIZADA ------------------

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-0">
        <div className="bg-white w-full h-full flex flex-col overflow-hidden">
          {/* Cabeçalho fixo */}
          <div className="flex-shrink-0 p-4 border-b bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-black">Relatório de Presença</h2>
              <button
                className="text-2xl text-gray-600"
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            {/* Filtros */}
            <div className="space-y-3">
              {/* Turma */}
              <div>
                <label className="text-sm font-medium text-black block mb-1">Turma:</label>
                <select
                  className="w-full p-2 border rounded-md bg-white text-black text-sm"
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

              {/* Período */}
              <div>
                <label className="text-sm font-medium text-black block mb-1">Período:</label>
                <div className="flex gap-2 mb-2">
                  <button
                    className={`flex-1 py-2 rounded-md text-sm ${tipoPeriodo === "ano" ? "bg-blue-100 border border-blue-300 text-black" : "bg-gray-100 text-black"}`}
                    onClick={() => setTipoPeriodo("ano")}
                  >
                    Ano
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-md text-sm ${tipoPeriodo === "mes" ? "bg-blue-100 border border-blue-300 text-black" : "bg-gray-100 text-black"}`}
                    onClick={() => setTipoPeriodo("mes")}
                  >
                    Mês
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-md text-sm ${tipoPeriodo === "custom" ? "bg-blue-100 border border-blue-300 text-black" : "bg-gray-100 text-black"}`}
                    onClick={() => setTipoPeriodo("custom")}
                  >
                    Personal.
                  </button>
                </div>

                {tipoPeriodo === "custom" && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 p-2 border rounded-md text-sm text-black"
                      value={inicio}
                      onChange={(e) => setInicio(e.target.value)}
                    />
                    <input
                      type="date"
                      className="flex-1 p-2 border rounded-md text-sm text-black"
                      value={fim}
                      onChange={(e) => setFim(e.target.value)}
                    />
                  </div>
                )}
                
                {/* 🔥 MOSTRAR PERÍODO ATUAL */}
                <div className="mt-2 text-xs text-black">
                  Período: {new Date(inicio).toLocaleDateString('pt-BR')} até {new Date(fim).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo rolável */}
          <div className="flex-1 overflow-y-auto p-4">
            {carregando ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : metricas.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-black">Nenhum dado encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metricas.map((aluno, index) => {
                  // 🔥 CÁLCULO SEGURO DO PERCENTUAL
                  const presentes = aluno.metricas?.presentes || 0;
                  const total = aluno.metricas?.total || 0;
                  const percentual = calcularPercentual(presentes, total);
                  
                  return (
                    <div key={index} className="border rounded-lg p-3 bg-white shadow-sm">
                      {/* Cabeçalho do aluno */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-black">#{index + 1}</span>
                            <span className="text-sm font-semibold text-black">
                              {formatarNome(aluno)}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-black">
                              {aluno.turma}
                            </span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-black">
                              {aluno.categoria_nome}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estatísticas */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {presentes}
                          </div>
                          <div className="text-xs text-black">Presentes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">
                            {aluno.metricas?.faltas || 0}
                          </div>
                          <div className="text-xs text-black">Faltas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {total}
                          </div>
                          <div className="text-xs text-black">Total Aulas</div>
                        </div>
                      </div>

                      {/* Percentual */}
                      <div className="flex items-center justify-between border-t pt-2">
                        <span className="text-sm font-medium text-black">Frequência:</span>
                        <span className={`text-sm font-bold ${corPercentual(percentual)}`}>
                          {percentual}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botão fixo na parte inferior */}
          <div className="flex-shrink-0 p-4 border-t bg-white">
            <button
              className="w-full bg-cor-primaria hover:bg-cor-destaque text-black py-3 rounded-md shadow font-medium disabled:opacity-50"
              onClick={handleExportarPDF}
              disabled={metricas.length === 0}
            >
              📄 Exportar PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------ DESKTOP (com correções) ------------------

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2">
      <div className="bg-white shadow-xl border p-6 rounded-lg overflow-y-auto max-w-[900px] max-h-[95vh] relative">
        <button
          className="absolute top-3 right-3 text-xl text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>

        <div style={{ width: "700px", margin: "0 auto" }}>
          <h2 className="text-2xl font-bold text-center mb-4 text-black">
            Relatório de Presença por Turma
          </h2>

          {/* 🔥 MOSTRAR INFORMAÇÕES DO PERÍODO */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-black">
                <span className="font-medium">Período selecionado:</span>
                <span className="ml-2">{new Date(inicio).toLocaleDateString('pt-BR')} até {new Date(fim).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="text-sm text-black">
                Total de alunos: {metricas.length}
              </div>
            </div>
          </div>

          {/* Turma */}
          <div className="mb-4">
            <label className="text-sm font-medium text-black">Turma:</label>
            <select
              className="w-full p-2 border rounded-md bg-white mt-1 text-black"
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

          {/* Período */}
          <div className="mb-4">
            <label className="text-sm font-medium text-black">Período:</label>

            <div className="flex flex-col gap-2 mt-1 text-black">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={tipoPeriodo === "ano"}
                  onChange={() => setTipoPeriodo("ano")}
                  className="mr-2"
                />
                Ano Atual
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  checked={tipoPeriodo === "mes"}
                  onChange={() => setTipoPeriodo("mes")}
                  className="mr-2"
                />
                Mês atual
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  checked={tipoPeriodo === "custom"}
                  onChange={() => setTipoPeriodo("custom")}
                  className="mr-2"
                />
                Personalizado
              </label>

              {tipoPeriodo === "custom" && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="date"
                    className="p-2 border rounded-md w-1/2 text-black"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                  />
                  <input
                    type="date"
                    className="p-2 border rounded-md w-1/2 text-black"
                    value={fim}
                    onChange={(e) => setFim(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {carregando && (
            <p className="text-center text-black my-6">Carregando métricas...</p>
          )}

          {!carregando && metricas.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border text-black">Nº</th>
                    <th className="p-2 border text-black">Nome</th>
                    <th className="p-2 border text-black">P</th>
                    <th className="p-2 border text-black">F</th>
                    <th className="p-2 border text-black">Aulas</th>
                    <th className="p-2 border text-black">%</th>
                    <th className="p-2 border text-black">Turma</th>
                    <th className="p-2 border text-black">Categoria</th>
                  </tr>
                </thead>

                <tbody>
                  {metricas.map((a, index) => {
                    const presentes = a.metricas?.presentes || 0;
                    const total = a.metricas?.total || 0;
                    const percentual = calcularPercentual(presentes, total);
                    const nomeCompleto = formatarNome(a);

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 border text-center text-black">{index + 1}</td>
                        <td className="p-2 border text-black">
                          <span className="text-sm">{nomeCompleto}</span>
                        </td>
                        <td className="p-2 border text-center text-black">{presentes}</td>
                        <td className="p-2 border text-center text-black">{a.metricas?.faltas || 0}</td>
                        <td className="p-2 border text-center text-black">{total}</td>
                        <td className={`p-2 border text-center ${corPercentual(percentual)}`}>
                          {percentual}%
                        </td>
                        <td className="p-2 border text-center text-black">{a.turma}</td>
                        <td className="p-2 border text-center text-black">{a.categoria_nome}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!carregando && metricas.length === 0 && (
            <div className="text-center my-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-black">Nenhum dado de frequência encontrado para o período selecionado.</p>
              <p className="text-sm text-gray-600 mt-1">Verifique as datas ou se há registros de presença.</p>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              className="bg-cor-primaria hover:bg-cor-destaque px-4 py-2 rounded-md shadow disabled:opacity-50 text-black"
              onClick={handleExportarPDF}
              disabled={metricas.length === 0}
            >
              📄 Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
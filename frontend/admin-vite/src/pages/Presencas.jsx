// src/pages/Presencas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  listarAlunos,
  listarTransferenciasPendentes,
  confirmarTransferencia,
} from "../services/alunoService";
import {
  salvarBatch,
  listarPorTurmaEData,
  listarAtividadesRecentes,
  atualizarPresenca,
} from "../services/presencaService";
import { listarTurmas, getMinhasTurmas } from "../services/turmaService";
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { logger } from "../utils/logger";
import InfoTip from "../components/ui/InfoTip";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function hojeIsoLocal() {
  const now = new Date();
  const tzOffsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

function parseDataFlex(raw) {
  if (!raw) return null;
  const valor = String(raw).trim();
  if (!valor) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return new Date(`${valor}T00:00:00-03:00`);
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(valor)) {
    // `updated_at` do banco pode vir sem timezone; tratamos como UTC.
    return new Date(`${valor.replace(" ", "T")}Z`);
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(valor)) {
    // ISO sem offset também deve ser interpretado como UTC.
    return new Date(`${valor}Z`);
  }
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function Presencas() {
  const query = useQuery();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const turmaId = query.get("turma"); // /presencas?turma=4
  const turmaIdNum = turmaId ? Number(turmaId) : null;

  const [data, setData] = useState(() => hojeIsoLocal());
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [alunosTurma, setAlunosTurma] = useState([]); // [{id, nome, apelido, turma_id}]
  const [itens, setItens] = useState([]); // [{ aluno_id, status }]

  // Turmas para as quais o usuário é responsável (instrutor OU admin com turma)
  const [minhasTurmas, setMinhasTurmas] = useState([]); // [{id, nome?}]
  // Todas as turmas (para resolver nome pelo id, se necessário)
  const [todasTurmas, setTodasTurmas] = useState([]); // [{id, nome}]
  const [descobrindoTurma, setDescobrindoTurma] = useState(true);
  const [atividadeInstrutor, setAtividadeInstrutor] = useState(null);
  const [historicoInstrutor, setHistoricoInstrutor] = useState([]);
  const [carregandoAtividades, setCarregandoAtividades] = useState(false);
  const [modalAtividade, setModalAtividade] = useState(null);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [modalDiasResumo, setModalDiasResumo] = useState(null);
  const [filtroDataHistorico, setFiltroDataHistorico] = useState("");
  const [detalhesAtividade, setDetalhesAtividade] = useState([]);
  const [carregandoDetalhesAtividade, setCarregandoDetalhesAtividade] = useState(false);
  const [salvandoPresencaId, setSalvandoPresencaId] = useState(null);
  const mostrarResumoInstrutor = true;
  const [anoResumoInstrutor, setAnoResumoInstrutor] = useState(new Date().getFullYear());
  const [turmaResumoAdmin, setTurmaResumoAdmin] = useState(null);
  const [mostrarUltimaChamadaAdmin, setMostrarUltimaChamadaAdmin] = useState(true);
  const [filtroUltimaChamadaAdmin, setFiltroUltimaChamadaAdmin] = useState("todas");
  const [abaPainel, setAbaPainel] = useState("chamada");
  const [agora, setAgora] = useState(() => new Date());
  const [transferenciasPendentes, setTransferenciasPendentes] = useState([]);
  const [confirmandoTransferenciaId, setConfirmandoTransferenciaId] = useState(null);

  const isAdmin = useMemo(
    () => Array.isArray(usuario?.roles) && usuario.roles.includes("admin"),
    [usuario]
  );

  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

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
        logger.error(e);
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

  const turmasPermitidas = useMemo(
    () => (isAdmin ? todasTurmas : minhasTurmas),
    [isAdmin, todasTurmas, minhasTurmas]
  );

  // Se não veio ?turma, autodetecta:
  // - Se houver 1 única turma responsável, redireciona direto
  // - Se houver mais de uma, mostra seletor
  useEffect(() => {
    if (turmaIdNum || descobrindoTurma) return;
    const idsPermitidos = (turmasPermitidas || []).map((t) => Number(t.id));
    if (isAdmin && idsPermitidos.length > 0) {
      navigate(`/presencas?turma=${idsPermitidos[0]}`, { replace: true });
      return;
    }
    if (idsPermitidos.length === 1) {
      navigate(`/presencas?turma=${idsPermitidos[0]}`, { replace: true });
    }
  }, [turmaIdNum, turmasPermitidas, descobrindoTurma, navigate, isAdmin]);

  // Verificação de permissão: só permite chamar turmas das quais o usuário é responsável
  const idsPermitidos = useMemo(
    () => new Set((turmasPermitidas || []).map((t) => Number(t.id))),
    [turmasPermitidas]
  );
  const turmaPermitida = turmaIdNum ? idsPermitidos.has(turmaIdNum) : false;

  useEffect(() => {
    if (!isAdmin) return;
    if (!Array.isArray(turmasPermitidas) || turmasPermitidas.length === 0) return;
    if (turmaResumoAdmin && turmasPermitidas.some((t) => Number(t.id) === Number(turmaResumoAdmin))) return;
    const preferida = turmaIdNum && turmasPermitidas.some((t) => Number(t.id) === Number(turmaIdNum))
      ? Number(turmaIdNum)
      : Number(turmasPermitidas[0].id);
    setTurmaResumoAdmin(preferida);
    logger.debug("[Presencas] turmaResumoAdmin:auto-select", {
      turmaIdQuery: turmaIdNum,
      turmaResumoAdminAnterior: turmaResumoAdmin,
      turmaResumoAdminNova: preferida,
      turmasPermitidas: turmasPermitidas.map((t) => Number(t.id)),
    });
  }, [isAdmin, turmasPermitidas, turmaResumoAdmin, turmaIdNum]);

  useEffect(() => {
    let ativo = true;
    async function carregarAtividades() {
      try {
        setCarregandoAtividades(true);
        if (isAdmin) {
          if (filtroUltimaChamadaAdmin === "todas") {
            const ids = (turmasPermitidas || []).map((t) => Number(t.id)).filter(Boolean);
            const respostas = await Promise.all(
              ids.map((id) => listarAtividadesRecentes(365, id).catch(() => null))
            );
            if (!ativo) return;
            const combinado = respostas
              .flatMap((resp) =>
                resp?.tipo === "admin_turma" && Array.isArray(resp.historico) ? resp.historico : []
              )
              .sort((a, b) => {
                const da = new Date(a?.data || 0).getTime();
                const db = new Date(b?.data || 0).getTime();
                if (db !== da) return db - da;
                const ua = new Date(a?.ultima_atualizacao || 0).getTime();
                const ub = new Date(b?.ultima_atualizacao || 0).getTime();
                return ub - ua;
              });
            setHistoricoInstrutor(combinado);
            setAtividadeInstrutor(combinado[0] || null);
            return;
          }

          const respTurma = turmaResumoAdmin
            ? await listarAtividadesRecentes(365, turmaResumoAdmin)
            : null;
          if (!ativo) return;
          if (respTurma?.tipo === "admin_turma") {
            setAtividadeInstrutor(respTurma?.atividade || null);
            setHistoricoInstrutor(Array.isArray(respTurma?.historico) ? respTurma.historico : []);
            logger.debug("[Presencas] atividades:admin", {
              turmaResumoAdmin,
              historicoTurma: Array.isArray(respTurma?.historico) ? respTurma.historico.length : 0,
              ultimaTurmaData: respTurma?.atividade?.data,
              ultimaTurmaTurmaId: respTurma?.atividade?.turma_id,
            });
          } else {
            setAtividadeInstrutor(null);
            setHistoricoInstrutor([]);
            logger.debug("[Presencas] atividades:admin_sem_turma", {
              turmaResumoAdmin,
              tipoRespostaTurma: respTurma?.tipo || null,
            });
          }
          return;
        }

        const resp = await listarAtividadesRecentes(365);
        if (!ativo) return;
        setAtividadeInstrutor(resp?.atividade || null);
        setHistoricoInstrutor(Array.isArray(resp?.historico) ? resp.historico : []);
        logger.debug("[Presencas] atividades:instrutor", {
          historico: Array.isArray(resp?.historico) ? resp.historico.length : 0,
          ultimaData: resp?.atividade?.data,
          ultimaTurmaId: resp?.atividade?.turma_id,
          ultimaAtualizacaoRaw: resp?.atividade?.ultima_atualizacao,
          historicoPrimeiraAtualizacaoRaw: Array.isArray(resp?.historico) ? resp?.historico?.[0]?.ultima_atualizacao : null,
        });
      } catch (e) {
        logger.error(e);
      } finally {
        if (ativo) setCarregandoAtividades(false);
      }
    }
    carregarAtividades();
    return () => {
      ativo = false;
    };
  }, [isAdmin, salvando, turmaResumoAdmin, mostrarUltimaChamadaAdmin, filtroUltimaChamadaAdmin, turmasPermitidas]);

  useEffect(() => {
    let ativo = true;
    async function carregarTransferenciasPendentesTurma() {
      if (!turmaIdNum || !turmaPermitida) {
        if (ativo) setTransferenciasPendentes([]);
        return;
      }
      try {
        const lista = await listarTransferenciasPendentes(turmaIdNum);
        if (!ativo) return;
        setTransferenciasPendentes(Array.isArray(lista) ? lista : []);
      } catch (error) {
        logger.error("[Presencas] Erro ao listar transferências pendentes:", error);
        if (ativo) setTransferenciasPendentes([]);
      }
    }
    carregarTransferenciasPendentesTurma();
    return () => {
      ativo = false;
    };
  }, [turmaIdNum, turmaPermitida, salvando]);

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
        logger.debug("[Presencas] carregarDia", {
          turmaId: turmaIdNum,
          dataSelecionada: data,
          nowIso: new Date().toISOString(),
          nowSp: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
          totalPresencasApi: Array.isArray(resp?.presencas) ? resp.presencas.length : 0,
        });
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
        logger.error(e);
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
      const totalPresentes = itens.filter((i) => i.status === "presente").length;
      const totalFaltas = itens.length - totalPresentes;
      logger.debug("[Presencas] salvarBatch:inicio", {
        turmaId: turmaIdNum,
        dataSelecionada: data,
        totalItens: itens.length,
        presentes: totalPresentes,
        faltas: totalFaltas,
        nowIso: new Date().toISOString(),
        nowSp: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      });
      await salvarBatch({
        turma_id: turmaIdNum,
        data,
        itens, // [{ aluno_id, status }]
      });
      logger.debug("[Presencas] salvarBatch:sucesso", {
        turmaId: turmaIdNum,
        dataSelecionada: data,
        nowIso: new Date().toISOString(),
        nowSp: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      });
      alert("Presenças salvas com sucesso!");
    } catch (e) {
      logger.error(e);
      alert(e?.response?.data?.erro || "Falha ao salvar presenças.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleConfirmarTransferencia(transferencia) {
    if (!transferencia?.id || !turmaIdNum) return;

    const ok = window.confirm(
      `Confirmar entrada de ${transferencia.aluno_nome || "aluno"} nesta turma?\n\n` +
        "Após confirmar, ele aparecerá na lista de chamada."
    );
    if (!ok) return;

    try {
      setConfirmandoTransferenciaId(transferencia.id);
      await confirmarTransferencia(transferencia.id);

      const [listaAtualizada, alunosAtualizados] = await Promise.all([
        listarTransferenciasPendentes(turmaIdNum).catch(() => []),
        listarAlunos(turmaIdNum).catch(() => []),
      ]);
      setTransferenciasPendentes(Array.isArray(listaAtualizada) ? listaAtualizada : []);
      setAlunosTurma(Array.isArray(alunosAtualizados) ? alunosAtualizados : []);
      alert("Transferência confirmada com sucesso.");
    } catch (error) {
      logger.error("[Presencas] Erro ao confirmar transferência:", error);
      alert(error?.response?.data?.erro || "Não foi possível confirmar a transferência.");
    } finally {
      setConfirmandoTransferenciaId(null);
    }
  }

  // ---- UI ----
  const tituloTurma =
    turmaIdNum && turmaPermitida
      ? nomeDaTurma(turmaIdNum) || `Turma #${turmaIdNum}`
      : turmaIdNum && !turmaPermitida
      ? "Sem permissão para esta turma"
      : "Selecione a turma";
  const escopoAdminLabel =
    filtroUltimaChamadaAdmin === "todas"
      ? "Escopo: todas as turmas"
      : `Escopo: ${nomeDaTurma(turmaResumoAdmin) || `Turma #${turmaResumoAdmin}`}`;

const alunosOrdenados = useMemo(() => {
  return [...alunosTurma].sort((a, b) => {
    const aKey = a.apelido?.trim() || a.nome || "";
    const bKey = b.apelido?.trim() || b.nome || "";

    return aKey.localeCompare(bKey, "pt-BR", {
      sensitivity: "base",
    });
  });
}, [alunosTurma]);


  const formatarDataHora = (raw) => {
    if (!raw) return "Sem registro";
    const d = parseDataFlex(raw);
    if (!d) return "Sem registro";
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  };

  const formatarHoraAtualSp = (date) =>
    date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Sao_Paulo",
    });

  const formatarDataDia = (raw) => {
    if (!raw) return "Data inválida";
    const valor = String(raw).trim();
    if (!valor) return "Data inválida";
    const d = parseDataFlex(valor);
    if (!d) return "Data inválida";
    return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  };

  const normalizarDataParaApi = (raw) => {
    if (!raw) return "";
    const valor = String(raw).trim();
    if (!valor) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
    const d = parseDataFlex(valor);
    if (!d) return "";
    return d.toISOString().slice(0, 10);
  };

  const historicoFiltrado = useMemo(() => {
    if (!filtroDataHistorico) return historicoInstrutor;
    return historicoInstrutor.filter((item) => String(item.data).slice(0, 10) === filtroDataHistorico);
  }, [historicoInstrutor, filtroDataHistorico]);
  const historicoCards = useMemo(
    () => (historicoInstrutor || []).slice(0, 3),
    [historicoInstrutor]
  );

  const historicoAnoLetivo = useMemo(() => {
    return (historicoInstrutor || []).filter((a) => {
      const d = new Date(a.data);
      if (Number.isNaN(d.getTime())) return false;
      return d.getFullYear() === Number(anoResumoInstrutor);
    });
  }, [historicoInstrutor, anoResumoInstrutor]);

  const resumoAnoLetivo = useMemo(() => {
    const base = historicoAnoLetivo;
    const totalAulas = base.length;
    const totalRegistros = base.reduce((acc, a) => acc + Number(a.total_registros || 0), 0);
    const presentes = base.reduce((acc, a) => acc + Number(a.presentes || 0), 0);
    const faltas = base.reduce((acc, a) => acc + Number(a.faltas || 0), 0);
    const taxa = totalRegistros > 0 ? Math.round((presentes / totalRegistros) * 100) : 0;

    const porTurmaMap = new Map();
    for (const a of base) {
      const key = Number(a.turma_id);
      const atual = porTurmaMap.get(key) || {
        turma_id: key,
        turma_nome: a.turma_nome || `Turma #${key}`,
        total: 0,
        presentes: 0,
      };
      atual.total += Number(a.total_registros || 0);
      atual.presentes += Number(a.presentes || 0);
      porTurmaMap.set(key, atual);
    }

    const turmas = Array.from(porTurmaMap.values())
      .map((t) => ({
        ...t,
        taxa: t.total > 0 ? Math.round((t.presentes / t.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      totalAulas,
      totalRegistros,
      presentes,
      faltas,
      taxa,
      turmas,
    };
  }, [historicoAnoLetivo]);

  useEffect(() => {
    logger.debug("[Presencas] resumoAnoLetivo", {
      isAdmin,
      turmaResumoAdmin,
      anoResumoInstrutor,
      historicoInstrutor: historicoInstrutor.length,
      totalAulas: resumoAnoLetivo.totalAulas,
      totalRegistros: resumoAnoLetivo.totalRegistros,
      presentes: resumoAnoLetivo.presentes,
      faltas: resumoAnoLetivo.faltas,
      taxa: resumoAnoLetivo.taxa,
    });
  }, [isAdmin, turmaResumoAdmin, anoResumoInstrutor, historicoInstrutor.length, resumoAnoLetivo]);

  async function carregarDetalhesAtividade(atividade, mostrarLoading = true) {
    if (!atividade) return;
    if (mostrarLoading) setCarregandoDetalhesAtividade(true);
    try {
      const dataRef = normalizarDataParaApi(atividade.data);
      if (!dataRef) {
        setDetalhesAtividade([]);
        return;
      }
      const resp = await listarPorTurmaEData(atividade.turma_id, dataRef);
      const lista = Array.isArray(resp?.presencas) ? resp.presencas : [];
      setDetalhesAtividade(lista);
      const presentes = lista.filter((p) => p.status === "presente").length;
      const faltas = lista.filter((p) => p.status !== "presente").length;
      setModalAtividade((prev) =>
        prev
          ? {
              ...prev,
              data: dataRef,
              total_registros: lista.length,
              presentes,
              faltas,
            }
          : prev
      );
    } catch (e) {
      logger.error(e);
    } finally {
      if (mostrarLoading) setCarregandoDetalhesAtividade(false);
    }
  }

  async function abrirModalAtividade(atividade) {
    setModalAtividade(atividade);
    setDetalhesAtividade([]);
    await carregarDetalhesAtividade(atividade, true);
  }

  function abrirDetalhesPeloHistorico(atividade) {
    setModalHistoricoAberto(false);
    setTimeout(() => {
      abrirModalAtividade(atividade);
    }, 0);
  }

  function abrirDiasDoResumo(tipo) {
    const base = historicoAnoLetivo;
    const itens = base.filter((a) => {
      if (tipo === "faltas") return Number(a.faltas || 0) > 0;
      if (tipo === "presentes") return Number(a.presentes || 0) > 0;
      return Number(a.total_registros || 0) > 0;
    });
    setModalDiasResumo({
      tipo,
      titulo:
        tipo === "faltas"
          ? "Dias com faltas"
          : tipo === "presentes"
          ? "Dias com presenças"
          : "Dias com registros",
      itens,
    });
  }

  function abrirChamadaDoDiaPeloResumo(atividade) {
    setModalDiasResumo(null);
    setTimeout(() => {
      abrirModalAtividade(atividade);
    }, 0);
  }

  function onChangeFiltroAdmin(valor) {
    if (valor === "todas") {
      setFiltroUltimaChamadaAdmin("todas");
      return;
    }
    setFiltroUltimaChamadaAdmin("turma");
    setTurmaResumoAdmin(Number(valor));
  }

  async function alterarStatusPresencaModal(registro, novoStatus) {
    if (!registro?.id) return;
    const statusAtual = registro.status === "presente" ? "presente" : "falta";
    if (statusAtual === novoStatus) return;

    const nome = registro.apelido || registro.aluno_nome || `Aluno #${registro.aluno_id}`;
    const ok = window.confirm(
      `Tem certeza que deseja alterar ${nome} para ${novoStatus === "presente" ? "Presente" : "Falta"}?`
    );
    if (!ok) return;

    try {
      setSalvandoPresencaId(registro.id);
      await atualizarPresenca(registro.id, { status: novoStatus });
      await carregarDetalhesAtividade(modalAtividade, false);
      if (isAdmin) {
        if (filtroUltimaChamadaAdmin === "todas") {
          const ids = (turmasPermitidas || []).map((t) => Number(t.id)).filter(Boolean);
          const respostas = await Promise.all(
            ids.map((id) => listarAtividadesRecentes(365, id).catch(() => null))
          );
          const combinado = respostas
            .flatMap((resp) =>
              resp?.tipo === "admin_turma" && Array.isArray(resp.historico) ? resp.historico : []
            )
            .sort((a, b) => {
              const da = new Date(a?.data || 0).getTime();
              const db = new Date(b?.data || 0).getTime();
              if (db !== da) return db - da;
              const ua = new Date(a?.ultima_atualizacao || 0).getTime();
              const ub = new Date(b?.ultima_atualizacao || 0).getTime();
              return ub - ua;
            });
          setHistoricoInstrutor(combinado);
          setAtividadeInstrutor(combinado[0] || null);
          return;
        }
        const respTurma = turmaResumoAdmin
          ? await listarAtividadesRecentes(365, turmaResumoAdmin)
          : null;
        if (respTurma?.tipo === "admin_turma") {
          setAtividadeInstrutor(respTurma?.atividade || null);
          setHistoricoInstrutor(Array.isArray(respTurma?.historico) ? respTurma.historico : []);
        } else {
          setAtividadeInstrutor(null);
          setHistoricoInstrutor([]);
        }
      } else {
        const resp = await listarAtividadesRecentes(365);
        setAtividadeInstrutor(resp?.atividade || null);
        setHistoricoInstrutor(Array.isArray(resp?.historico) ? resp.historico : []);
      }
    } catch (e) {
      logger.error(e);
      alert(e?.response?.data?.erro || "Não foi possível atualizar a presença.");
    } finally {
      setSalvandoPresencaId(null);
    }
  }


  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-28 px-1 sm:px-2">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-cor-fundo/90 backdrop-blur-sm py-3">
        <div className="mx-2 flex items-center gap-3 rounded-2xl border border-cor-secundaria/25 bg-gradient-to-r from-[#0d2a21]/95 to-[#14362b]/90 px-3 py-3 shadow-[0_10px_28px_rgba(0,0,0,0.25)]">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-xl border border-cor-secundaria/35 bg-cor-fundo/30 flex items-center justify-center hover:bg-cor-fundo/55 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-cor-texto/70">Chamada</div>
            <div className="text-base font-semibold text-cor-titulo truncate">
              {tituloTurma}
            </div>
            {isAdmin && (
              <div className="text-[11px] text-cor-texto/65 mt-0.5">
                Turma em edição da chamada
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-2 rounded-2xl border border-cor-secundaria/20 bg-gradient-to-br from-[#0e2c23] to-[#163a2f] p-2 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAbaPainel("chamada")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              abaPainel === "chamada"
                ? "bg-cor-primaria text-[#1a2213]"
                : "border border-cor-secundaria/30 text-cor-titulo hover:bg-cor-fundo/35"
            }`}
          >
            Chamada
          </button>
          <button
            type="button"
            onClick={() => setAbaPainel("informacoes")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
              abaPainel === "informacoes"
                ? "bg-cor-primaria text-[#1a2213]"
                : "border border-cor-secundaria/30 text-cor-titulo hover:bg-cor-fundo/35"
            }`}
          >
            Informações
          </button>
        </div>
      </div>

      {abaPainel === "informacoes" && (
        <>
      {isAdmin && (
        <div className="mx-2 rounded-2xl border border-cor-secundaria/20 bg-gradient-to-br from-[#0e2c23] to-[#163a2f] p-4 space-y-3 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
          <button
            type="button"
            onClick={() => setMostrarUltimaChamadaAdmin((v) => !v)}
            className="rounded-xl border border-cor-secundaria/30 bg-cor-fundo/20 px-3 py-2 text-sm font-semibold text-cor-titulo hover:bg-cor-fundo/35 transition-colors"
          >
            {mostrarUltimaChamadaAdmin ? "Ocultar última chamada" : "Ver última chamada"}
          </button>
        </div>
      )}

      {(!isAdmin || (isAdmin && turmaResumoAdmin && mostrarUltimaChamadaAdmin)) && (
        <div className="mx-2 rounded-2xl border border-cor-secundaria/20 bg-gradient-to-br from-[#0e2c23] to-[#163a2f] p-4 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-cor-titulo">
              {isAdmin && filtroUltimaChamadaAdmin === "todas"
                ? "Últimas chamadas"
                : isAdmin
                ? "Última chamada da turma"
                : "Sua última chamada"}
            </p>
            {isAdmin && (
              <select
                value={
                  filtroUltimaChamadaAdmin === "todas"
                    ? "todas"
                    : String(turmaResumoAdmin || "")
                }
                onChange={(e) => onChangeFiltroAdmin(e.target.value)}
                className="h-8 rounded-lg border border-cor-secundaria/35 bg-cor-fundo/25 px-2 text-xs"
              >
                <option value="todas">Todas as turmas</option>
                {turmasPermitidas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {`Somente: ${t.nome || `Turma #${t.id}`}`}
                  </option>
                ))}
              </select>
            )}
          </div>
          {isAdmin && (
            <p className="text-[11px] text-cor-texto/70 mt-1">{escopoAdminLabel}</p>
          )}
          {carregandoAtividades && (
            <p className="text-xs text-cor-texto/60 mt-1">Carregando…</p>
          )}
          {!carregandoAtividades && !atividadeInstrutor && (
            <p className="text-xs text-cor-texto/70 mt-1">
              {isAdmin
                ? "Sem chamada registrada para a turma selecionada."
                : "Você ainda não registrou chamada."}
            </p>
          )}
          {!carregandoAtividades && atividadeInstrutor && (
            <>
              {isAdmin ? (
                <>
                  <div className="mt-2 space-y-2">
                    {historicoCards.map((atividade, idx) => (
                      <button
                        key={`${atividade.turma_id}-${atividade.data}-${idx}`}
                        type="button"
                        onClick={() => abrirModalAtividade(atividade)}
                        className="w-full rounded-xl border border-cor-secundaria/20 bg-cor-fundo/20 px-3 py-2 text-left hover:bg-cor-fundo/35 transition-colors"
                      >
                        <p className="text-xs text-cor-titulo font-semibold">
                          {atividade.turma_nome} • {formatarDataDia(atividade.data)}
                        </p>
                        <p className="text-[11px] text-cor-texto/70">
                          Atualizado em {formatarDataHora(atividade.ultima_atualizacao)}
                        </p>
                      </button>
                    ))}
                  </div>
                  {historicoInstrutor.length > 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroDataHistorico("");
                        setModalHistoricoAberto(true);
                      }}
                      className="text-xs underline text-cor-primaria mt-2 ml-3 font-medium"
                    >
                      Ver tudo
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs text-cor-texto/70 mt-1 flex flex-wrap items-center gap-2">
                    <span>
                      {atividadeInstrutor.turma_nome} • {formatarDataDia(atividadeInstrutor.data)}
                    </span>
                    <span className="text-red-300/90">
                      Faltas: {Number(atividadeInstrutor.faltas || 0)}
                    </span>
                    <span className="text-green-300/90">
                      Presenças: {Number(atividadeInstrutor.presentes || 0)}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => abrirModalAtividade(atividadeInstrutor)}
                    className="text-xs underline text-cor-primaria mt-2 font-medium"
                  >
                    Ver detalhes da chamada
                  </button>
                  {historicoInstrutor.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroDataHistorico("");
                        setModalHistoricoAberto(true);
                      }}
                      className="text-xs underline text-cor-primaria mt-2 ml-3 font-medium"
                    >
                      Ver todas chamadas
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {(!isAdmin || (isAdmin && turmaResumoAdmin)) && (
        <div className="mx-2 rounded-2xl border border-cor-secundaria/20 bg-gradient-to-br from-[#0e2c23] to-[#163a2f] p-4 space-y-3 shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-cor-titulo">
                {isAdmin ? "Resumo geral das turmas" : "Resumo geral"}
              </p>
              {isAdmin && (
                <select
                  value={
                    filtroUltimaChamadaAdmin === "todas"
                      ? "todas"
                      : String(turmaResumoAdmin || "")
                  }
                  onChange={(e) => onChangeFiltroAdmin(e.target.value)}
                  className="h-8 rounded-lg border border-cor-secundaria/35 bg-cor-fundo/25 px-2 text-xs"
                  aria-label="Selecionar turma do resumo"
                >
                  <option value="todas">Todas as turmas</option>
                  {turmasPermitidas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {`Somente: ${t.nome || `Turma #${t.id}`}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setAnoResumoInstrutor((ano) => ano - 1)}
                className="px-2 py-1 rounded-lg text-xs border border-cor-secundaria/30 text-cor-texto hover:bg-cor-fundo/35 transition-colors"
              >
                Ano anterior
              </button>
              <button
                type="button"
                onClick={() => setAnoResumoInstrutor(new Date().getFullYear())}
                className={`px-2 py-1 rounded-lg text-xs border transition-colors ${
                  anoResumoInstrutor === new Date().getFullYear()
                    ? "border-cor-primaria/60 bg-cor-primaria/20 text-cor-primaria"
                    : "border-cor-secundaria/30 text-cor-texto hover:bg-cor-fundo/35"
                }`}
              >
                Ano atual
              </button>
            </div>
          </div>

          <>
              <p className="text-xs text-cor-texto/70">
                Ano letivo <strong>{anoResumoInstrutor}</strong> • <strong>{resumoAnoLetivo.totalAulas}</strong> aulas registradas.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-cor-secundaria/20 bg-cor-fundo/25 p-2">
                  <p className="text-cor-texto/70">Taxa de presença</p>
                  <p className="text-sm font-bold text-cor-titulo">{resumoAnoLetivo.taxa}%</p>
                </div>
                <button
                  type="button"
                  onClick={() => abrirDiasDoResumo("registros")}
                  className="rounded-lg border border-cor-secundaria/20 bg-cor-fundo/25 p-2 text-left hover:bg-cor-fundo/40 transition-colors"
                >
                  <p className="text-cor-texto/70">Registros</p>
                  <p className="text-sm font-bold text-cor-titulo">{resumoAnoLetivo.totalRegistros}</p>
                </button>
                <button
                  type="button"
                  onClick={() => abrirDiasDoResumo("presentes")}
                  className="rounded-lg border border-green-500/30 bg-green-500/5 p-2 text-left hover:bg-green-500/10 transition-colors"
                >
                  <p className="text-green-300">Presentes</p>
                  <p className="text-sm font-bold text-green-300">{resumoAnoLetivo.presentes}</p>
                </button>
                <button
                  type="button"
                  onClick={() => abrirDiasDoResumo("faltas")}
                  className="rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-left hover:bg-red-500/10 transition-colors"
                >
                  <p className="text-red-300">Faltas</p>
                  <p className="text-sm font-bold text-red-300">{resumoAnoLetivo.faltas}</p>
                </button>
              </div>

              <div className="rounded-xl border border-cor-secundaria/20 bg-cor-fundo/25 p-3">
                <p className="text-xs font-semibold text-cor-titulo mb-2">
                  {isAdmin ? "Desempenho da turma selecionada" : "Desempenho por turma"}
                </p>
                <ul className="space-y-1">
                  {resumoAnoLetivo.turmas.slice(0, 4).map((turma) => (
                    <li key={turma.turma_id} className="text-xs flex items-center justify-between gap-2">
                      <span className="text-cor-texto truncate">{turma.turma_nome}</span>
                      <span className="text-cor-titulo font-semibold">{turma.taxa}%</span>
                    </li>
                  ))}
                  {resumoAnoLetivo.turmas.length === 0 && (
                    <li className="text-xs text-cor-texto/70">Sem aulas registradas nesse ano letivo.</li>
                  )}
                </ul>
              </div>
            </>
        </div>
      )}
        </>
      )}

      {abaPainel === "chamada" && (
        <>
      {/* Seletor de turma quando não vier ?turma=ID */}
      {!turmaIdNum && (
        <div className="mx-2 rounded-2xl border border-cor-secundaria/20 bg-gradient-to-br from-[#0e2c23] to-[#163a2f] shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
          <div className="p-4">
            <div className="text-sm font-semibold text-cor-titulo">
              Selecione a turma
            </div>
            <p className="text-xs text-cor-texto/70 mt-1">
              Toque na turma para abrir a chamada da data selecionada.
            </p>

            {descobrindoTurma && (
              <p className="text-xs text-cor-texto/60 mt-3">
                Carregando turmas…
              </p>
            )}

            {!descobrindoTurma && turmasPermitidas.length === 0 && (
              <div className="mt-3 text-xs">
                {isAdmin
                  ? "Nenhuma turma cadastrada."
                  : "Você não é responsável por nenhuma turma."}
              </div>
            )}

            {!descobrindoTurma && turmasPermitidas.length > 0 && (
              <ul className="mt-3 divide-y divide-cor-secundaria/10">
                {turmasPermitidas.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => navigate(`/presencas?turma=${t.id}`)}
                      className="w-full text-left px-3 py-3 text-sm flex items-center justify-between active:scale-[0.99] hover:bg-cor-fundo/30 transition-colors"
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

      <div className="mx-2 rounded-2xl border border-cor-secundaria/25 bg-gradient-to-r from-[#0f2e24] to-[#184436] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
        <p className="text-sm font-semibold text-cor-titulo">
          Chamada da turma: <span className="text-cor-primaria">{tituloTurma}</span>
        </p>
        <InfoTip type="info" className="mt-2 !py-2 !px-3 text-xs">
          A chamada usa a data selecionada. Altere somente quando precisar lançar outro dia.
        </InfoTip>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-cor-texto/85">
          <label className="inline-flex items-center gap-2">
            <span>Referente ao dia:</span>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="h-8 rounded-lg border border-cor-secundaria/35 px-2 text-xs bg-cor-fundo/25 text-cor-titulo"
              aria-label="Selecionar dia da chamada"
            />
          </label>
          <p className="inline-flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4 text-cor-primaria" />
            <span>Horário atual: <span className="font-semibold text-cor-titulo">{formatarHoraAtualSp(agora)}</span></span>
          </p>
        </div>
      </div>

      {turmaIdNum && turmaPermitida && transferenciasPendentes.length > 0 && (
        <div className="mx-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-amber-100">
              Transferências pendentes para esta turma
            </p>
            <span className="text-[11px] text-amber-100/80">
              {transferenciasPendentes.length} pendente(s)
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {transferenciasPendentes.slice(0, 6).map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-amber-300/25 bg-cor-fundo/20 px-3 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-cor-titulo truncate">
                    {item.aluno_nome || "Aluno"} • origem: {item.turma_origem_nome || "-"}
                  </p>
                  <p className="text-[11px] text-cor-texto/70 mt-1 truncate">
                    Solicitado por {item.solicitado_por_nome || "instrutor"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleConfirmarTransferencia(item)}
                  disabled={confirmandoTransferenciaId === item.id}
                  className="h-8 rounded-lg border border-amber-300/40 bg-amber-300/20 px-3 text-xs font-semibold text-amber-100 hover:bg-amber-300/30 disabled:opacity-60"
                >
                  {confirmandoTransferenciaId === item.id
                    ? "Confirmando..."
                    : "Confirmar entrada na chamada"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de alunos com toggles grandes */}
      <div className="mx-2 rounded-2xl border border-cor-secundaria/20 bg-gradient-to-br from-[#0e2c23] to-[#163a2f] shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
        <div className="p-4 border-b border-cor-secundaria/15">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm font-semibold text-cor-titulo">Lista de alunos</p>
            <div className="inline-flex items-center gap-2">
              <button
                disabled={
                  !turmaIdNum ||
                  !turmaPermitida ||
                  carregando ||
                  alunosTurma.length === 0
                }
                onClick={() => marcarTodos("presente")}
                className={`h-8 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                  turmaIdNum && turmaPermitida && !carregando && alunosTurma.length
                    ? "border-green-500/50 bg-green-500/12 text-green-200 hover:bg-green-500/20"
                    : "border-cor-secundaria/15 text-cor-texto/60"
                }`}
              >
                Todos presentes
              </button>
              <button
                disabled={
                  !turmaIdNum ||
                  !turmaPermitida ||
                  carregando ||
                  alunosTurma.length === 0
                }
                onClick={() => marcarTodos("falta")}
                className={`h-8 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                  turmaIdNum && turmaPermitida && !carregando && alunosTurma.length
                    ? "border-red-500/50 bg-red-500/12 text-red-200 hover:bg-red-500/20"
                    : "border-cor-secundaria/15 text-cor-texto/60"
                }`}
              >
                Todos falta
              </button>
            </div>
          </div>
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
  {alunosOrdenados.map((aluno, index) => {
    const status = mapaStatus.get(aluno.id) || "falta";
    const presente = status === "presente";

    return (
      <li
        key={aluno.id}
        className="flex items-center justify-between px-4 py-3 hover:bg-cor-fundo/25 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-xs font-semibold text-cor-texto/50 w-5 text-right">
            {index + 1}.
          </span>

          <div className="min-w-0">
  <div className="text-sm font-medium text-cor-titulo truncate">
    {aluno.apelido || aluno.nome}
  </div>

  {aluno.apelido && (
    <div className="text-[11px] text-cor-texto/60 truncate">
      {aluno.nome}
    </div>
  )}
</div>

        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusAluno(aluno.id, "falta")}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold ${
              !presente
                ? "bg-red-500 text-white border-red-500"
                : "border-cor-secundaria/30 text-cor-texto/80"
            }`}
          >
            Falta
          </button>

          <button
            type="button"
            onClick={() => setStatusAluno(aluno.id, "presente")}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold ${
              presente
                ? "bg-green-600 text-white border-green-600"
                : "border-cor-secundaria/30 text-cor-texto/80"
            }`}
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
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,360px)]">
        <button
          disabled={
            !turmaIdNum || !turmaPermitida || salvando || itens.length === 0
          }
          onClick={handleSalvar}
          className={`w-full rounded-xl px-5 py-2.5 text-white shadow-lg flex items-center justify-center gap-2 text-sm font-semibold
      ${
        !turmaIdNum || !turmaPermitida || salvando || itens.length === 0
          ? "bg-cor-secundaria/35 text-cor-texto/70"
          : "bg-gradient-to-r from-[#f4cf4e] to-[#f0bc3d] text-[#1a2213] hover:brightness-105 active:scale-[0.99]"
      }
    `}
          aria-label="Salvar presenças"
        >
          <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          {salvando ? "Salvando..." : "Salvar presenças"}
        </button>
      </div>
        </>
      )}

      {modalAtividade && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-3">
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setModalAtividade(null)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-cor-secundaria/20 bg-gradient-to-br from-[#0f2e24] to-[#173d31] p-4 max-h-[80vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-cor-titulo">
                  {modalAtividade.nome_instrutor || "Instrutor"} • {modalAtividade.turma_nome}
                </h3>
                <p className="text-xs text-cor-texto/70">
                  {formatarDataDia(modalAtividade.data)} •
                  Atualizado em {formatarDataHora(modalAtividade.ultima_atualizacao)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAtividade(null)}
                className="text-sm rounded-lg border border-cor-secundaria/30 px-2 py-1"
              >
                Fechar
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-cor-secundaria/20 bg-cor-fundo/20 p-2">
                <p className="text-cor-texto/70">Total</p>
                <p className="font-bold text-cor-titulo">{Number(modalAtividade.total_registros || 0)}</p>
              </div>
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-2">
                <p className="text-green-400/90">Presentes</p>
                <p className="font-bold text-green-300">{Number(modalAtividade.presentes || 0)}</p>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-2">
                <p className="text-red-400/90">Faltas</p>
                <p className="font-bold text-red-300">{Number(modalAtividade.faltas || 0)}</p>
              </div>
            </div>

            {carregandoDetalhesAtividade && (
              <p className="text-xs text-cor-texto/70 mt-3">Carregando detalhes…</p>
            )}

            {!carregandoDetalhesAtividade && (
              <ul className="mt-3 divide-y divide-cor-secundaria/10 rounded-lg border border-cor-secundaria/20">
                {detalhesAtividade.map((p) => (
                  <li key={p.id || `${p.aluno_id}-${p.data}`} className="p-2 text-xs flex items-center justify-between gap-2">
                    <span className="text-cor-titulo truncate">{p.apelido || p.aluno_nome || `Aluno #${p.aluno_id}`}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={salvandoPresencaId === p.id}
                        onClick={() => alterarStatusPresencaModal(p, "falta")}
                        className={`px-2 py-1 rounded border ${
                          p.status !== "presente"
                            ? "bg-red-500 text-white border-red-500"
                            : "border-cor-secundaria/30 text-cor-texto/80"
                        } ${salvandoPresencaId === p.id ? "opacity-60" : ""}`}
                      >
                        Falta
                      </button>
                      <button
                        type="button"
                        disabled={salvandoPresencaId === p.id}
                        onClick={() => alterarStatusPresencaModal(p, "presente")}
                        className={`px-2 py-1 rounded border ${
                          p.status === "presente"
                            ? "bg-green-600 text-white border-green-600"
                            : "border-cor-secundaria/30 text-cor-texto/80"
                        } ${salvandoPresencaId === p.id ? "opacity-60" : ""}`}
                      >
                        Presente
                      </button>
                    </div>
                  </li>
                ))}
                {detalhesAtividade.length === 0 && (
                  <li className="p-2 text-xs text-cor-texto/70">Sem detalhes para esta chamada.</li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {modalHistoricoAberto && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModalHistoricoAberto(false)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-cor-secundaria/20 bg-cor-fundo p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-cor-titulo">Seus registros de chamada</h3>
                <p className="text-xs text-cor-texto/70">Use o calendário para filtrar por data.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalHistoricoAberto(false)}
                className="text-sm rounded-lg border border-cor-secundaria/30 px-2 py-1"
              >
                Fechar
              </button>
            </div>

            <div className="mt-3">
              <input
                type="date"
                className="h-9 rounded-lg border border-cor-secundaria/30 px-2 text-sm bg-transparent"
                value={filtroDataHistorico}
                onChange={(e) => setFiltroDataHistorico(e.target.value)}
                aria-label="Filtrar histórico por data"
              />
              {filtroDataHistorico && (
                <button
                  type="button"
                  onClick={() => setFiltroDataHistorico("")}
                  className="ml-2 text-xs underline text-cor-primaria"
                >
                  Limpar filtro
                </button>
              )}
            </div>

            <ul className="mt-3 divide-y divide-cor-secundaria/10 rounded-lg border border-cor-secundaria/20">
              {historicoFiltrado.map((atividade, idx) => (
                <li key={`${atividade.turma_id}-${atividade.data}-${idx}`} className="p-3">
                  <button
                    type="button"
                    onClick={() => abrirDetalhesPeloHistorico(atividade)}
                    className="w-full text-left"
                  >
                    <p className="text-sm font-semibold text-cor-titulo">
                      {atividade.turma_nome}
                    </p>
                    <p className="text-xs text-cor-texto/70">
                      {formatarDataDia(atividade.data)} • Atualizado em {formatarDataHora(atividade.ultima_atualizacao)}
                    </p>
                    <p className="text-[11px] mt-1 flex items-center gap-3">
                      <span className="text-red-300/90">
                        Faltas: {Number(atividade.faltas || 0)}
                      </span>
                      <span className="text-green-300/90">
                        Presenças: {Number(atividade.presentes || 0)}
                      </span>
                    </p>
                  </button>
                </li>
              ))}
              {historicoFiltrado.length === 0 && (
                <li className="p-3 text-xs text-cor-texto/70">Nenhum registro para esta data.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {modalDiasResumo && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center p-3">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModalDiasResumo(null)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-cor-secundaria/20 bg-cor-fundo p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-cor-titulo">{modalDiasResumo.titulo}</h3>
                <p className="text-xs text-cor-texto/70">
                  Toque em um dia para abrir a chamada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalDiasResumo(null)}
                className="text-sm rounded-lg border border-cor-secundaria/30 px-2 py-1"
              >
                Fechar
              </button>
            </div>

            <ul className="mt-3 divide-y divide-cor-secundaria/10 rounded-lg border border-cor-secundaria/20">
              {modalDiasResumo.itens.map((atividade, idx) => (
                <li key={`${atividade.turma_id}-${atividade.data}-${idx}`} className="p-3">
                  <button
                    type="button"
                    onClick={() => abrirChamadaDoDiaPeloResumo(atividade)}
                    className="w-full text-left"
                  >
                    <p className="text-sm font-semibold text-cor-titulo">
                      {formatarDataDia(atividade.data)}
                    </p>
                    <p className="text-xs text-cor-texto/70">
                      {atividade.turma_nome} • Presentes: {Number(atividade.presentes || 0)} • Faltas: {Number(atividade.faltas || 0)}
                    </p>
                  </button>
                </li>
              ))}
              {modalDiasResumo.itens.length === 0 && (
                <li className="p-3 text-xs text-cor-texto/70">
                  Nenhum dia encontrado para esse filtro.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

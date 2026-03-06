// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { listarEventos } from "../services/agendaService";
import { listarImagens } from "../services/galeriaService";
import { listarLembretes } from "../services/lembretesService";
import { useAuth } from "../contexts/AuthContext";
import { usePermissao } from "../hooks/usePermissao";
import CardEstat from "../components/ui/CardEstat";
import {
  ClipboardDocumentListIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import api from "../services/api";

import {
  UserGroupIcon,
  CalendarIcon,
  BellAlertIcon,
  NewspaperIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import ModalLembretes from "../components/lembretes/ModalLembretes";
import InfoTip from "../components/ui/InfoTip";
const logoSistema = "/icons/icon-192.png";
import {
  listarAlunos,
  solicitarTransferenciaTurma,
  desfazerTransferencia,
  listarAuditoriaAtividades,
  listarTransferenciasRecentes,
} from "../services/alunoService";
import { getMinhasTurmas, listarTurmas } from "../services/turmaService";
import { logger } from "../utils/logger";
import { TZ_SAO_PAULO, formatDateTime, parseDateTime } from "../utils/datetime";

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { temPapel } = usePermissao();
  const isAdmin = temPapel(["admin"]);
  const [qtdEventos, setQtdEventos] = useState(0);
  const [abrirModal, setAbrirModal] = useState(false);
  const [qtdAlunos, setQtdAlunos] = useState(0);
  const [minhasTurmas, setMinhasTurmas] = useState([]);
  const [temTurmaResponsavel, setTemTurmaResponsavel] = useState(false);
  const [resumoTurmasInstrutor, setResumoTurmasInstrutor] = useState([]);
  const [resumoTurmasKey, setResumoTurmasKey] = useState(0);
  const [turmaOrigemAjuste, setTurmaOrigemAjuste] = useState("");
  const [turmaDestinoAjuste, setTurmaDestinoAjuste] = useState("");
  const [alunoSelecionadoAjuste, setAlunoSelecionadoAjuste] = useState("");
  const [alunosTurmaOrigem, setAlunosTurmaOrigem] = useState([]);
  const [carregandoAlunosAjuste, setCarregandoAlunosAjuste] = useState(false);
  const [salvandoAjusteTurma, setSalvandoAjusteTurma] = useState(false);
  const [turmasDestinoDisponiveis, setTurmasDestinoDisponiveis] = useState([]);
  const [noticiasResumo, setNoticiasResumo] = useState([]);
  const [abrirModalHistoricoSistema, setAbrirModalHistoricoSistema] = useState(false);
  const [auditoriaAtividades, setAuditoriaAtividades] = useState([]);
  const [auditoriaRefreshKey, setAuditoriaRefreshKey] = useState(0);
  const turmasOrigemAjuste = isAdmin ? turmasDestinoDisponiveis : minhasTurmas;
  const turmasDestinoAjuste = isAdmin ? turmasDestinoDisponiveis : minhasTurmas;

  const mapearTransferenciasParaAuditoria = (rows) =>
    (Array.isArray(rows) ? rows : []).map((item) => {
      const nomeAluno = item.aluno_nome || `Aluno #${item.aluno_id}`;
      const origem = item.turma_origem_nome || `Turma #${item.turma_origem_id}`;
      const destino = item.turma_destino_nome || `Turma #${item.turma_destino_id}`;
      const status = item.status || "pendente";
      const acao =
        status === "confirmada"
          ? "transferencia_confirmada"
          : status === "cancelada"
          ? "transferencia_cancelada"
          : "transferencia_solicitada";

      return {
        id: `fallback-trf-${item.id}`,
        entidade: "transferencia_turma",
        entidade_id: String(item.id),
        acao,
        descricao: `Transferência de ${nomeAluno}: ${origem} -> ${destino}`,
        usuario_nome: item.confirmado_por_nome || item.solicitado_por_nome || null,
        metadata: { transferencia_id: item.id, status },
        created_at: item.confirmed_at || item.created_at,
      };
    });

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const lista = await getMinhasTurmas();
        if (!ativo) return;
        const arr = Array.isArray(lista) ? lista : [];
        setMinhasTurmas(arr);
        setTemTurmaResponsavel(arr.length > 0);
      } catch (e) {
        logger.error("Erro ao buscar minhas turmas:", e);
        setMinhasTurmas([]);
        setTemTurmaResponsavel(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    async function carregarResumoTurmas() {
      if (!Array.isArray(minhasTurmas) || minhasTurmas.length === 0) {
        setResumoTurmasInstrutor([]);
        return;
      }
      try {
        const respostas = await Promise.all(
          minhasTurmas.map(async (turma) => {
            const alunos = await listarAlunos(turma.id);
            return {
              id: turma.id,
              nome: turma.nome || `Turma #${turma.id}`,
              totalAlunos: Array.isArray(alunos) ? alunos.length : 0,
            };
          })
        );
        if (!ativo) return;
        setResumoTurmasInstrutor(respostas);
      } catch (error) {
        logger.error("Erro ao montar resumo por turma:", error);
        if (ativo) setResumoTurmasInstrutor([]);
      }
    }
    carregarResumoTurmas();
    return () => {
      ativo = false;
    };
  }, [minhasTurmas, resumoTurmasKey]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const turmas = await listarTurmas();
        if (!ativo) return;
        setTurmasDestinoDisponiveis(Array.isArray(turmas) ? turmas : []);
      } catch (error) {
        logger.error("Erro ao listar turmas para destino de transferência:", error);
        if (ativo) setTurmasDestinoDisponiveis([]);
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    (async () => {
      if (!isAdmin) return;
      try {
        const itens = await listarAuditoriaAtividades(200);
        if (!ativo) return;
        if (Array.isArray(itens) && itens.length > 0) {
          setAuditoriaAtividades(itens);
          return;
        }

        const transferencias = await listarTransferenciasRecentes(200);
        if (!ativo) return;
        setAuditoriaAtividades(mapearTransferenciasParaAuditoria(transferencias));
      } catch (error) {
        const status = error?.response?.status;
        if (status === 404) {
          try {
            const transferencias = await listarTransferenciasRecentes(200);
            if (!ativo) return;
            setAuditoriaAtividades(mapearTransferenciasParaAuditoria(transferencias));
            return;
          } catch (fallbackError) {
            logger.error("Erro ao carregar fallback de auditoria:", fallbackError);
          }
        } else {
          logger.error("Erro ao carregar auditoria de atividades:", error);
        }
        if (ativo) setAuditoriaAtividades([]);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [auditoriaRefreshKey, isAdmin]);

  useEffect(() => {
    let ativo = true;
    async function carregarAlunosDaTurmaOrigem() {
      if (!turmaOrigemAjuste) {
        setAlunosTurmaOrigem([]);
        setAlunoSelecionadoAjuste("");
        return;
      }

      setCarregandoAlunosAjuste(true);
      try {
        const alunos = await listarAlunos(Number(turmaOrigemAjuste));
        if (!ativo) return;
        setAlunosTurmaOrigem(Array.isArray(alunos) ? alunos : []);
      } catch (error) {
        logger.error("Erro ao carregar alunos da turma para ajuste rápido:", error);
        if (ativo) setAlunosTurmaOrigem([]);
      } finally {
        if (ativo) setCarregandoAlunosAjuste(false);
      }
    }
    carregarAlunosDaTurmaOrigem();
    return () => {
      ativo = false;
    };
  }, [turmaOrigemAjuste, resumoTurmasKey]);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const alunos = await listarAlunos();
        setQtdAlunos(alunos.length);
      } catch (error) {
        logger.error("Erro ao buscar alunos:", error);
      }
    };

    fetchAlunos();
  }, []);
  const botoes = [
    {
      to: "/equipe",
      label: "Equipe",
      roles: ["admin"],
    },
    { to: "/turmas", label: "Turmas", roles: ["admin", ""] },
    { to: "/loja", label: "Loja", roles: ["loja", "admin"] },
    { to: "/admin/produtos", label: "Estoque", roles: ["admin", "loja"] },
    { to: "/contatos", label: "Contatos", roles: ["admin"] },
    { to: "/config", label: "Configurações", roles: ["admin"] },
  ];

  const [eventosResumo, setEventosResumo] = useState([]);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const eventos = await listarEventos();
        setQtdEventos(Array.isArray(eventos) ? eventos.length : 0);
        setEventosResumo(Array.isArray(eventos) ? eventos : []);
      } catch (error) {
        logger.error("Erro ao buscar eventos:", error);
      }
    };

    fetchEventos();
  }, []);

  const [lembretes, setLembretes] = useState([]);

  async function buscarLembretes() {
    try {
      const lista = await listarLembretes("pendente");
      setLembretes(lista);
    } catch (err) {
      logger.error("Erro ao buscar lembretes:", err);
    }
  }

  useEffect(() => {
    buscarLembretes();
  }, []);

  const [qtdFotos, setQtdFotos] = useState(0);
  const [qtdPreMatriculas, setQtdPreMatriculas] = useState(0);

  useEffect(() => {
    const fetchFotos = async () => {
      try {
        const imagens = await listarImagens();
        const lista = Array.isArray(imagens) ? imagens : [];
        setQtdFotos(lista.length);
        setNoticiasResumo(lista);
      } catch (error) {
        logger.error("Erro ao buscar fotos:", error);
      }
    };

    fetchFotos();
  }, []);
  useEffect(() => {
    async function fetchPreMatriculas() {
      try {
        const { data } = await api.get(
          `/public/admin/pre-matriculas/pendentes/${usuario.organizacao_id}`
        );
        setQtdPreMatriculas(data.length || 0);
      } catch (error) {
        logger.error("Erro ao buscar pré-matrículas pendentes:", error);
        setQtdPreMatriculas(0);
      }
    }

    if (usuario?.roles?.includes("admin")) {
      fetchPreMatriculas();
    }
  }, [usuario]);

  const eventosOrdenados = Array.isArray(eventosResumo)
    ? [...eventosResumo].sort((a, b) => {
        const dataA = new Date(a.data_inicio);
        const dataB = new Date(b.data_inicio);
        return dataA - dataB;
      })
    : [];

  const getEventoTimestamp = (evento) => {
    const raw = evento?.data_fim || evento?.data_inicio || evento?.data;
    if (!raw) return Number.NaN;
    const parsed = new Date(raw).getTime();
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const eventosFuturos = eventosOrdenados.filter(
    (evento) => getEventoTimestamp(evento) >= Date.now()
  );
  const proximoEvento = eventosFuturos[0] || null;
  const outrosEventos = eventosFuturos.slice(1, 6);

  const formatarDataEvento = (evento) => {
    const raw = evento?.data_inicio || evento?.data;
    if (!raw) return "Data a definir";
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return "Data a definir";
    const data = parsed.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const hora = parsed.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return hora === "00:00" ? data : `${data} • ${hora}`;
  };

  const abrirTelaChamada = () => {
    if (minhasTurmas.length === 1) {
      navigate(`/presencas?turma=${minhasTurmas[0].id}`);
      return;
    }
    navigate("/presencas");
  };

  const formatarDataAtividade = (value) => {
    const texto = formatDateTime(
      value,
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
      "utc"
    );
    return texto || "Sem data";
  };

  const parseDataAuditoria = (value) => {
    return parseDateTime(value, "utc");
  };

  const atividadesSistema = useMemo(() => {
    return (auditoriaAtividades || [])
      .map((item) => ({
      id: `aud-${item.id}`,
      tipo: item.entidade || "sistema",
      entidadeId: item.entidade_id || null,
      transferenciaId: item.metadata?.transferencia_id || null,
      transferenciaStatus: item.metadata?.status || null,
      acao: item.acao || null,
      quando: item.created_at,
      descricao: item.descricao || "Atividade registrada",
      usuarioNome: item.usuario_nome || null,
      }))
      .filter((item) => parseDataAuditoria(item.quando))
      .sort(
        (a, b) =>
          parseDataAuditoria(b.quando).getTime() - parseDataAuditoria(a.quando).getTime()
      );
  }, [auditoriaAtividades]);

  const alteracoesMesAtual = useMemo(() => {
    const agora = new Date();
    const [mesAtual, anoAtual] = [
      Number(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: TZ_SAO_PAULO,
          month: "2-digit",
        }).format(agora)
      ),
      Number(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: TZ_SAO_PAULO,
          year: "numeric",
        }).format(agora)
      ),
    ];
    return atividadesSistema.filter((item) => {
      const data = parseDataAuditoria(item.quando);
      if (!data) return false;

      const mesItem = Number(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: TZ_SAO_PAULO,
          month: "2-digit",
        }).format(data)
      );
      const anoItem = Number(
        new Intl.DateTimeFormat("pt-BR", {
          timeZone: TZ_SAO_PAULO,
          year: "numeric",
        }).format(data)
      );
      return mesItem === mesAtual && anoItem === anoAtual;
    }).length;
  }, [atividadesSistema]);

  const obterDestinoAtividade = (item) => {
    const entidadeIdNum = Number(item?.entidadeId);
    const transferenciaIdNum = Number(item?.transferenciaId);

    if (item?.tipo === "agenda" && Number.isFinite(entidadeIdNum) && entidadeIdNum > 0) {
      return `/agenda?refEvento=${entidadeIdNum}`;
    }
    if (item?.tipo === "noticia" && Number.isFinite(entidadeIdNum) && entidadeIdNum > 0) {
      return `/noticias?refNoticia=${entidadeIdNum}`;
    }
    if (
      item?.tipo === "transferencia_turma" &&
      Number.isFinite(transferenciaIdNum) &&
      transferenciaIdNum > 0
    ) {
      return "/alunos";
    }
    return null;
  };

  const abrirReferenciaAtividade = (item) => {
    const destino = obterDestinoAtividade(item);
    if (!destino) return;
    navigate(destino);
  };

  const handleDesfazerTransferencia = async (atividade) => {
    const transferenciaId = Number(atividade?.transferenciaId);
    if (!transferenciaId) return;
    const status = String(atividade?.transferenciaStatus || "");
    const ehPendente = status === "pendente";

    const confirmar = window.confirm(
      ehPendente
        ? "Confirme que deseja cancelar esta transferência pendente."
        : "Confirme que deseja desfazer esta transferência.\n\nEsta ação moverá o aluno de volta para a turma de origem."
    );
    if (!confirmar) return;

    const texto = window.prompt('Digite DESFAZER para confirmar a operação:');
    if (texto !== "DESFAZER") {
      window.alert("Confirmação inválida. Operação cancelada.");
      return;
    }

    try {
      await desfazerTransferencia(transferenciaId);
      window.alert(
        ehPendente
          ? "Transferência pendente cancelada com sucesso."
          : "Transferência desfeita com sucesso."
      );
      setResumoTurmasKey((prev) => prev + 1);
      setAuditoriaRefreshKey((prev) => prev + 1);
    } catch (error) {
      logger.error("Erro ao desfazer transferência:", error);
      window.alert(error?.response?.data?.erro || "Não foi possível desfazer a transferência.");
    }
  };

  const salvarAjusteRapidoTurma = async () => {
    if (!turmaOrigemAjuste || !alunoSelecionadoAjuste || !turmaDestinoAjuste) {
      window.alert("Selecione turma de origem, aluno e nova turma.");
      return;
    }
    if (Number(turmaOrigemAjuste) === Number(turmaDestinoAjuste)) {
      window.alert("A nova turma precisa ser diferente da turma atual.");
      return;
    }

    const aluno = alunosTurmaOrigem.find(
      (item) => Number(item.id) === Number(alunoSelecionadoAjuste)
    );
    const turmaOrigem = turmasOrigemAjuste.find(
      (item) => Number(item.id) === Number(turmaOrigemAjuste)
    );
    const turmaDestino = turmasDestinoAjuste.find(
      (item) => Number(item.id) === Number(turmaDestinoAjuste)
    );

    const confirmar = window.confirm(
      `Confirmar transferência?\n\nAluno: ${aluno?.nome || "Sem nome"}\nDe: ${
        turmaOrigem?.nome || "Turma origem"
      }\nPara: ${turmaDestino?.nome || "Turma destino"}`
    );
    if (!confirmar) return;

    try {
      setSalvandoAjusteTurma(true);
      await solicitarTransferenciaTurma(
        Number(alunoSelecionadoAjuste),
        Number(turmaOrigemAjuste),
        Number(turmaDestinoAjuste)
      );
      window.alert("Transferência solicitada. A turma destino precisa confirmar.");
      setAlunoSelecionadoAjuste("");
      setTurmaDestinoAjuste("");
      setResumoTurmasKey((prev) => prev + 1);
      setAuditoriaRefreshKey((prev) => prev + 1);
    } catch (error) {
      logger.error("Erro ao executar ajuste rápido de turma:", error);
      window.alert(error?.response?.data?.erro || "Não foi possível solicitar a transferência.");
    } finally {
      setSalvandoAjusteTurma(false);
    }
  };

  return (
    <>
      <div className="space-y-6 pb-28">
        {/* Boas-vindas */}
        <div className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30">
          <h2 className="text-2xl font-bold text-cor-titulo">
            Olá, {usuario?.nome || "Usuário"}!
          </h2>
          <p className="text-sm text-cor-texto/80 mt-1">
            Bem-vindo ao painel de administração
          </p>

          <div className="mt-3 flex items-center gap-4">
            {temPapel(["admin"]) && (
              <button
                onClick={() => navigate("/config")}
                className="text-xs text-cor-texto/70 hover:text-cor-primaria flex items-center gap-1"
              >
                <Cog6ToothIcon className="h-4 w-4" /> Configurar sistema
              </button>
            )}

            <button
              onClick={() => navigate("/perfil")}
              className="text-xs text-cor-texto/70 hover:text-cor-primaria flex items-center gap-1"
            >
              <UserCircleIcon className="h-4 w-4" /> Editar meu perfil
            </button>
          </div>
        </div>

        {temPapel(["admin"]) && (
          <div className="rounded-2xl p-4 border border-cor-secundaria/30 bg-cor-card/70">
            <InfoTip type="info" className="mb-2 !py-2 !px-3 text-xs">
              Auditoria de atividades no sistema.
            </InfoTip>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-cor-titulo">
                Controle do sistema
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[11px] rounded-full border border-cor-secundaria/35 px-2 py-1 text-cor-texto/80">
                  Alterações do sistema: {alteracoesMesAtual} no mês • {atividadesSistema.length} totais
                </span>
                <button
                  type="button"
                  onClick={() => setAbrirModalHistoricoSistema(true)}
                  className="text-xs text-cor-texto/70 hover:text-cor-primaria"
                >
                  Ver tudo
                </button>
              </div>
            </div>
            {atividadesSistema.length === 0 ? (
              <p className="text-xs text-cor-texto/70">
                Nenhuma atividade registrada ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {atividadesSistema.slice(0, 3).map((item) => (
                  <li
                    key={item.id}
                    onClick={() => abrirReferenciaAtividade(item)}
                    className={`rounded-lg border border-cor-secundaria/20 bg-cor-secundaria/10 px-3 py-2 ${
                      obterDestinoAtividade(item) ? "cursor-pointer hover:bg-cor-secundaria/20" : ""
                    }`}
                  >
                    <p className="text-xs text-cor-texto/90">{item.descricao}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-[11px] text-cor-texto/65">
                        {item.usuarioNome ? `${item.usuarioNome} • ` : ""}
                        {formatarDataAtividade(item.quando)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            item.transferenciaStatus === "confirmada"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                              : item.transferenciaStatus === "cancelada"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                          }`}
                        >
                          {item.transferenciaStatus
                            ? item.transferenciaStatus.toUpperCase()
                            : item.tipo.toUpperCase()}
                        </span>
                        {item.transferenciaId &&
                          ["confirmada", "pendente"].includes(item.transferenciaStatus) && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDesfazerTransferencia(item);
                              }}
                              className="rounded-md border border-rose-300/40 bg-rose-300/15 px-2 py-1 text-[11px] font-semibold text-rose-100 hover:bg-rose-300/25"
                            >
                              {item.transferenciaStatus === "pendente" ? "Cancelar" : "Desfazer"}
                            </button>
                          )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Ação Rápida: Chamada (outline, diferente dos cards) */}
        {(temPapel(["instrutor"]) ||
          (temPapel(["admin"]) && temTurmaResponsavel)) && (
          <button
            onClick={abrirTelaChamada}
            aria-label="Abrir chamada para tirar faltas"
            className="w-full rounded-xl border-2 border-dashed border-cor-primaria/80 
               bg-transparent text-cor-primaria px-4 py-3
               flex items-center justify-between
               active:scale-[0.99] transition
               focus:outline-none focus:ring-2 focus:ring-cor-primaria/40"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg border border-cor-primaria/50 
                      flex items-center justify-center"
              >
                <ClipboardDocumentListIcon
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[15px] font-semibold">
                  Chamada (tirar faltas)
                </div>
                <div className="text-xs opacity-80">
                  {minhasTurmas.length === 1
                    ? minhasTurmas[0]?.nome
                      ? `Turma: ${minhasTurmas[0].nome}`
                      : "sua turma"
                    : "selecione a turma"}
                </div>
              </div>
            </div>
            <ChevronRightIcon
              className="h-5 w-5 opacity-90"
              aria-hidden="true"
            />
          </button>
        )}

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
          {/* Card Alunos */}
          <div className="relative">
            <CardEstat
              valor={qtdAlunos}
              label="Alunos"
              Icon={UserGroupIcon}
              cor="green"
              onClick={() => navigate("/alunos")}
              cursor="pointer"
            />

            {/* Badge apenas para admin */}
            {usuario?.roles?.includes("admin") && qtdPreMatriculas > 0 && (
              <span className="absolute top-[0px] left-[32px] border border-red-500 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center z-[999]">
                {qtdPreMatriculas}
              </span>
            )}
          </div>

          {/* Lembretes — admin e instrutor */}
          <CardEstat
            valor={lembretes.length}
            label="Lembretes"
            Icon={BellAlertIcon}
            cor="red"
            onClick={() => setAbrirModal(true)}
            cursor="pointer"
          />

          {/* 👇 SOMENTE ADMIN 👇 */}
          {temPapel(["admin"]) && (
            <>
              <CardEstat
                valor={qtdEventos}
                label="Eventos"
                Icon={CalendarIcon}
                cor="blue"
                onClick={() => navigate("/agenda")}
                cursor="pointer"
              />

              <CardEstat
                valor={qtdFotos}
                label="Noticias"
                Icon={NewspaperIcon}
                cor="amber"
                onClick={() => navigate("/noticias")}
                cursor="pointer"
              />
            </>
          )}
        </div>

        {/* Agenda — somente admin */}
        {temPapel(["admin"]) && (
          <div className="rounded-xl p-4 border border-cor-secundaria/20 bg-cor-secundaria/10">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-cor-texto/75">Agenda</h3>
              <button
                type="button"
                onClick={() => navigate("/agenda")}
                className="text-xs font-medium text-cor-texto/65 hover:text-cor-primaria transition-colors"
              >
                Ver tudo
              </button>
            </div>

            <ul className="space-y-1.5">
              {proximoEvento ? (
                <>
                  <li key={proximoEvento.id}>
                    <Link
                      to="/agenda"
                      className="block rounded-lg border border-cor-primaria/30 bg-cor-primaria/10 px-2.5 py-2 hover:bg-cor-primaria/15 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="inline-flex rounded-full border border-cor-primaria/35 bg-cor-fundo/40 px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-cor-primaria mb-1.5">
                            PROXIMO EVENTO
                          </span>
                          <p className="text-sm font-semibold text-cor-texto/95 truncate">
                            {proximoEvento.titulo || "Evento sem título"}
                          </p>
                          <p className="mt-0.5 text-xs text-cor-texto/65 truncate">
                            {proximoEvento.local || "Local a definir"}
                          </p>
                        </div>
                        <span className="shrink-0 text-[11px] text-cor-texto/70 whitespace-nowrap">
                          {formatarDataEvento(proximoEvento)}
                        </span>
                      </div>
                    </Link>
                  </li>

                  {outrosEventos.map((evento) => (
                    <li key={evento.id}>
                      <Link
                        to="/agenda"
                        className="block rounded-lg px-2.5 py-2 hover:bg-cor-secundaria/20 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-cor-texto/90 truncate">
                              {evento.titulo || "Evento sem título"}
                            </p>
                            <p className="mt-0.5 text-xs text-cor-texto/60 truncate">
                              {evento.local || "Local a definir"}
                            </p>
                          </div>
                          <span className="shrink-0 text-[11px] text-cor-texto/65 whitespace-nowrap">
                            {formatarDataEvento(evento)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </>
              ) : (
                <li className="px-2.5 py-2 text-sm text-cor-texto/60">
                  Nenhum evento futuro disponível.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Acesso Rápido */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          id="buttons-section"
        >
          {botoes
            .filter((botao) => temPapel(botao.roles))
            .map((botao) => (
              <BotaoModulo key={botao.to} to={botao.to} label={botao.label} />
            ))}
        </div>

        {/* Aviso Interno (Lembretes Dinâmicos) */}
        <div
          id="lembretes-section"
          onClick={() => setAbrirModal(true)}
          className="cursor-pointer bg-yellow-100/10 text-yellow-400 border border-yellow-400/20 p-4 rounded-xl hover:bg-yellow-100/20 transition space-y-1"
        >
          <ExclamationTriangleIcon className="h-5 w-5 inline mr-1" />
          <strong className="text-yellow-300 block">Lembretes :</strong>
          {lembretes.length > 0 ? (
            lembretes.map((item) => (
              <p
                key={item.id}
                className={`text-sm ${
                  item.prioridade === "alta"
                    ? "text-red-500"
                    : item.prioridade === "media"
                    ? "text-yellow-400"
                    : "text-cor-clara/80"
                }`}
              >
                • {item.titulo}
              </p>
            ))
          ) : (
            <p className="text-sm text-yellow-100/40">
              Nenhum lembrete pendente.
            </p>
          )}
        </div>

        {(temPapel(["instrutor"]) ||
          (temPapel(["admin"]) && turmasOrigemAjuste.length > 0)) && (
          <div className="rounded-2xl p-4 border border-sky-300/45 bg-gradient-to-r from-sky-500/15 to-sky-300/10 space-y-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-sky-100">
                  Ajuste rapido de turma
                </h3>
                <p className="text-xs text-sky-50/85 mt-0.5">
                  Muda somente a turma do aluno com confirmação. Sem abrir edição completa.
                </p>
              </div>
              <span className="text-[11px] rounded-full border border-sky-300/45 px-2 py-1 text-sky-100">
                {turmasOrigemAjuste.length} turma{turmasOrigemAjuste.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-sky-300/35 bg-cor-fundo/20 p-2">
                <p className="text-sky-50/80">Turmas</p>
                <p className="text-sm font-bold text-sky-100">{turmasOrigemAjuste.length}</p>
              </div>
              <div className="rounded-lg border border-sky-300/35 bg-cor-fundo/20 p-2">
                <p className="text-sky-50/80">Lembretes</p>
                <p className="text-sm font-bold text-sky-100">{lembretes.length}</p>
              </div>
              <div className="rounded-lg border border-sky-300/35 bg-cor-fundo/20 p-2">
                <p className="text-sky-50/80">Alunos</p>
                <p className="text-sm font-bold text-sky-100">
                  {resumoTurmasInstrutor.reduce((acc, turma) => acc + Number(turma.totalAlunos || 0), 0)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-sky-300/35 bg-cor-fundo/20 p-3">
              <p className="text-xs font-semibold text-sky-100 mb-2">Transferência segura</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <label className="text-xs text-sky-50/85">
                  Turma atual
                  <select
                    value={turmaOrigemAjuste}
                    onChange={(e) => {
                      setTurmaOrigemAjuste(e.target.value);
                      setAlunoSelecionadoAjuste("");
                    }}
                    className="mt-1 w-full rounded-lg border border-sky-300/35 bg-cor-fundo/30 px-2 py-2 text-xs text-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                  >
                    <option value="">Selecione</option>
                    {turmasOrigemAjuste.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome || `Turma #${turma.id}`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-sky-50/85">
                  Aluno
                  <select
                    value={alunoSelecionadoAjuste}
                    onChange={(e) => setAlunoSelecionadoAjuste(e.target.value)}
                    disabled={!turmaOrigemAjuste || carregandoAlunosAjuste}
                    className="mt-1 w-full rounded-lg border border-sky-300/35 bg-cor-fundo/30 px-2 py-2 text-xs text-sky-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                  >
                    <option value="">
                      {carregandoAlunosAjuste ? "Carregando..." : "Selecione"}
                    </option>
                    {alunosTurmaOrigem.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.apelido || aluno.nome || `Aluno #${aluno.id}`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs text-sky-50/85">
                  Nova turma
                  <select
                    value={turmaDestinoAjuste}
                    onChange={(e) => setTurmaDestinoAjuste(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-sky-300/35 bg-cor-fundo/30 px-2 py-2 text-xs text-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300/40"
                  >
                    <option value="">Selecione</option>
                    {turmasDestinoAjuste
                      .filter((turma) => Number(turma.id) !== Number(turmaOrigemAjuste))
                      .map((turma) => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome || `Turma #${turma.id}`}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-sky-50/70">
                  Fluxo seguro: cria solicitação e aguarda confirmação da turma destino.
                </p>
                <button
                  type="button"
                  onClick={salvarAjusteRapidoTurma}
                  disabled={salvandoAjusteTurma}
                  className="rounded-lg border border-sky-300/40 bg-sky-300/20 px-3 py-2 text-xs font-semibold text-sky-100 hover:bg-sky-300/30 disabled:opacity-60 transition-colors"
                >
                  {salvandoAjusteTurma ? "Salvando..." : "Solicitar transferência"}
                </button>
              </div>
            </div>
          </div>
        )}
      {abrirModalHistoricoSistema && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar histórico do sistema"
            className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
            onClick={() => setAbrirModalHistoricoSistema(false)}
          />
          <div className="relative z-[71] w-full max-w-2xl rounded-2xl border border-[#2f4f44] bg-[#0b1b17] p-4 max-h-[80vh] overflow-auto shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-[#f3f7f5]">Histórico completo do sistema</h3>
              <button
                type="button"
                onClick={() => setAbrirModalHistoricoSistema(false)}
                className="rounded-lg border border-[#3e6659] px-3 py-1.5 text-xs text-[#d2ddd8] hover:bg-[#123127]"
              >
                Fechar
              </button>
            </div>
            {atividadesSistema.length === 0 ? (
              <p className="text-sm text-[#b8c9c2]">Nenhuma atividade registrada.</p>
            ) : (
              <ul className="space-y-2">
                {atividadesSistema.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => abrirReferenciaAtividade(item)}
                    className={`rounded-lg border border-[#2e4a40] bg-[#102721] px-3 py-2 ${
                      obterDestinoAtividade(item) ? "cursor-pointer hover:bg-[#143228]" : ""
                    }`}
                  >
                    <p className="text-sm text-[#e4ece9]">{item.descricao}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-xs text-[#9db2aa]">
                        {item.usuarioNome ? `${item.usuarioNome} • ` : ""}
                        {formatarDataAtividade(item.quando)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            item.transferenciaStatus === "confirmada"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                              : item.transferenciaStatus === "cancelada"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-400/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                          }`}
                        >
                          {item.transferenciaStatus
                            ? item.transferenciaStatus.toUpperCase()
                            : item.tipo.toUpperCase()}
                        </span>
                        {item.transferenciaId &&
                          ["confirmada", "pendente"].includes(item.transferenciaStatus) && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDesfazerTransferencia(item);
                              }}
                              className="rounded-md border border-rose-300/40 bg-rose-300/15 px-2 py-1 text-[11px] font-semibold text-rose-100 hover:bg-rose-300/25"
                            >
                              {item.transferenciaStatus === "pendente" ? "Cancelar" : "Desfazer"}
                            </button>
                          )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      </div>

      <ModalLembretes
        aberto={abrirModal}
        aoFechar={() => {
          setAbrirModal(false);
          buscarLembretes();
        }}
      />
      <div className="flex flex-col items-center pt-10">
        <img
          src={logoSistema}
          alt="Capoeira Base"
          className="h-20 w-20 object-cover rounded-full border-2 border-[#f4cf4e]/80 bg-cor-fundo/30"
        />
        <p className="mt-1 text-sm text-cor-texto/60 tracking-wide font-semibold">
          CAPOEIRA BASE
        </p>
        <p className="text-xs text-cor-texto/50 tracking-wide">
          Sistema para gerenciamento de grupos de capoeira
        </p>
      </div>
    </>
  );
}

function BotaoModulo({ to, label }) {
  const [ativo, setAtivo] = React.useState(false);

  React.useEffect(() => {
    if (ativo) {
      const timeout = setTimeout(() => setAtivo(false), 1000); // remove após 1s
      return () => clearTimeout(timeout);
    }
  }, [ativo]);

  return (
    <Link
      to={to}
      onClick={() => setAtivo(false)} // remove se clicar direto
      className={`bg-cor-card border border-cor-secundaria/30 text-cor-titulo text-sm font-medium rounded-xl p-4 text-center transition-all ${
        ativo ? "bg-cor-secundaria" : "hover:bg-cor-secundaria"
      }`}
    >
      {label}
    </Link>
  );
}

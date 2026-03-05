// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
import logo from "../assets/images/logo.png";
import { listarAlunos } from "../services/alunoService";
import { getMinhasTurmas } from "../services/turmaService";
import { logger } from "../utils/logger";

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { temPapel } = usePermissao();
  const [qtdEventos, setQtdEventos] = useState(0);
  const [abrirModal, setAbrirModal] = useState(false);
  const [qtdAlunos, setQtdAlunos] = useState(0);
  const [minhasTurmas, setMinhasTurmas] = useState([]);
  const [temTurmaResponsavel, setTemTurmaResponsavel] = useState(false);

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
    { to: "/Loja", label: "Loja", roles: ["loja", "admin"] },
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
        setQtdFotos(imagens.length);
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

        {/* Ação Rápida: Chamada (outline, diferente dos cards) */}
        {(temPapel(["instrutor"]) ||
          (temPapel(["admin"]) && temTurmaResponsavel)) && (
          <button
            onClick={() => {
              if (minhasTurmas.length === 1) {
                // vai direto para a turma do usuário
                navigate(`/presencas?turma=${minhasTurmas[0].id}`);
              } else {
                // deixa escolher na página de presenças
                navigate("/presencas");
              }
            }}
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
      </div>
      <ModalLembretes
        aberto={abrirModal}
        aoFechar={() => {
          setAbrirModal(false);
          buscarLembretes();
        }}
      />
      <div className="flex flex-col items-center pt-10">
        <img src={logo} alt="Logo da associação" className="h-36" />
        <p className="mt-1 text-sm text-cor-texto/60 tracking-wide font-semibold">
          CAPOEIRA NOTA 10
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

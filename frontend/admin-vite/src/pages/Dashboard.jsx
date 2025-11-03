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
  PhotoIcon,
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
    { to: "/turmas", label: "Turmas", roles: ["admin", "instrutor"] },
    { to: "/uniformes", label: "Loja", roles: ["loja", "admin"] },
    { to: "/horarios", label: "Horários", roles: ["admin", "instrutor"] },
    { to: "/video-aulas", label: "Aulas", roles: ["admin", "instrutor"] },
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
          {/* Card Alunos com badge */}
          <div className="relative">
            <CardEstat
              valor={qtdAlunos}
              label="Alunos"
              Icon={UserGroupIcon}
              cor="green"
              onClick={() => navigate("/alunos")}
              cursor="pointer"
            />

            {/* Badge sobre o ícone */}
            {usuario?.roles?.includes("admin") && qtdPreMatriculas > 0 && (
              <span className="absolute top-[1px] left-[37px] sm:top-[8px] sm:left-[48px]  bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {qtdPreMatriculas}
              </span>
            )}
          </div>

          {/* Outros cards */}
          <CardEstat
            valor={lembretes.length}
            label="Lembretes"
            Icon={BellAlertIcon}
            cor="red"
            onClick={() => setAbrirModal(true)}
            cursor="pointer"
          />

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
            label="Fotos"
            Icon={PhotoIcon}
            cor="amber"
            onClick={() => navigate("/galeria")}
            cursor="pointer"
          />
        </div>

        {/* Agenda */}
        <div className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30">
          <h3 className="text-lg font-semibold text-cor-titulo mb-4">
            📅 Agenda
          </h3>
          <ul className="space-y-2 text-sm text-cor-texto/80">
            {eventosOrdenados.length > 0 ? (
              eventosOrdenados.slice(0, 5).map((evento) => (
                <li key={evento.id}>
                  <Link
                    to="/agenda"
                    className="block hover:text-cor-primaria transition"
                  >
                    <span className="text-sm text-cor-texto/80">
                      • <strong>{evento.titulo}</strong> <br />
                      <span className="text-xs text-cor-texto/60">
                        {evento.data_formatada} às {evento.horario_formatado}
                      </span>
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <li>Sem eventos cadastrados.</li>
            )}
          </ul>
        </div>

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

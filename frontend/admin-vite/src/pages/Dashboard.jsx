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
  UserGroupIcon,
  CalendarIcon,
  BellAlertIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import ModalLembretes from "../components/lembretes/ModalLembretes";
import logo from "../assets/images/logo.png";
import { listarAlunos } from "../services/alunoService";

export default function Dashboard() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { temPapel } = usePermissao();
  const [qtdEventos, setQtdEventos] = useState(0);
  const [abrirModal, setAbrirModal] = useState(false);
  const [qtdAlunos, setQtdAlunos] = useState(0);
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const alunos = await listarAlunos();
        setQtdAlunos(alunos.length);
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
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
  ];

  const [eventosResumo, setEventosResumo] = useState([]);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const eventos = await listarEventos();
        setQtdEventos(Array.isArray(eventos) ? eventos.length : 0);
        setEventosResumo(Array.isArray(eventos) ? eventos : []);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
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
      console.error("Erro ao buscar lembretes:", err);
    }
  }

  useEffect(() => {
    buscarLembretes();
  }, []);

  const [qtdFotos, setQtdFotos] = useState(0);

  useEffect(() => {
    const fetchFotos = async () => {
      try {
        const imagens = await listarImagens();
        setQtdFotos(imagens.length);
      } catch (error) {
        console.error("Erro ao buscar fotos:", error);
      }
    };

    fetchFotos();
  }, []);


  const eventosOrdenados = Array.isArray(eventosResumo)
    ? [...eventosResumo].sort((a, b) => {
        const dataA = new Date(a.data_inicio);
        const dataB = new Date(b.data_inicio);
        return dataA - dataB;
      })
    : [];

  return (
    <>
      <div className="space-y-6 pb-10">
        {/* Boas-vindas */}
        <div className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30">
          <h2 className="text-2xl font-bold text-cor-titulo">
            Olá, {usuario?.nome || "Usuário"}!
          </h2>
          <p className="text-sm text-cor-texto/80 mt-1">
            Bem-vindo ao painel de administração
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <CardEstat
            valor={qtdAlunos}
            label="Alunos"
            Icon={UserGroupIcon}
            cor="green"
            onClick={() => {
              navigate("/alunos");
            }}
            cursor="pointer"
          />

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
            onClick={() => {
              navigate("/agenda");
            }}
            cursor={"pointer"}
          />

          <CardEstat
            valor={qtdFotos}
            label="Fotos"
            Icon={PhotoIcon}
            cor="amber"
            onClick={() => {
              navigate("/galeria");
            }}
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

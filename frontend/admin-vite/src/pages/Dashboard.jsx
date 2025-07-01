// src/pages/Dashboard.jsx
import React from "react";
import { useEffect, useState } from "react";
import { listarEventos } from "../services/agendaService";
import { listarImagens } from "../services/galeriaService";
import { listarLembretes } from "../services/lembretesService";
import { useAuth } from "../contexts/AuthContext";
import { usePermissao } from "../hooks/usePermissao";
import {
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import ModalLembretes from "../components/lembretes/ModalLembretes";

export default function Dashboard() {
  const { usuario } = useAuth();
  const { temPapel } = usePermissao();
  const [qtdEventos, setQtdEventos] = useState(0);
  const [abrirModal, setAbrirModal] = useState(false);

  const botoes = [
    { to: "/galeria", label: "Galeria", roles: ["admin", "midia"] },
    { to: "/agenda", label: "Eventos", roles: ["admin", "instrutor"] },
    { to: "/alunos", label: "Alunos", roles: ["admin"] },
    {
      to: "/mensalidades",
      label: "Mensalidades",
      roles: ["financeiro", "admin"],
    },
    { to: "/uniformes", label: "Loja", roles: ["loja", "admin"] },
    { to: "/horarios", label: "Horários", roles: ["admin", "instrutor"] },
    { to: "/video-aulas", label: "Aulas", roles: ["admin", "instrutor"] }, // Definido agora
  ];

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const eventos = await listarEventos();
        setQtdEventos(eventos.length);
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

  return (
    <>
      <div className="space-y-6">
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
            valor="24"
            label="Alunos ativos"
            Icon={UserGroupIcon}
            cor="green"
          />
          <CardEstat
            valor="5"
            label="Pendências"
            Icon={CurrencyDollarIcon}
            cor="red"
          />
          <CardEstat
            valor={qtdEventos}
            label="Eventos"
            Icon={CalendarIcon}
            cor="blue"
          />
          <CardEstat
            valor={qtdFotos}
            label="Fotos"
            Icon={PhotoIcon}
            cor="amber"
          />
        </div>

        {/* Agenda da Semana */}
        <div className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30">
          <h3 className="text-lg font-semibold text-cor-titulo mb-4">
            📅 Agenda da Semana
          </h3>
          <ul className="space-y-2 text-sm text-cor-texto/80">
            <li>• Segunda 19h – Aula Infantil</li>
            <li>• Terça 20h – Roda Cultural</li>
            <li>• Quinta 18h – Aula Adulto</li>
          </ul>
        </div>

        {/* Acesso Rápido */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {botoes
            .filter((botao) => temPapel(botao.roles))
            .map((botao) => (
              <BotaoModulo key={botao.to} to={botao.to} label={botao.label} />
            ))}
        </div>

        {/* Aviso Interno (Lembretes Dinâmicos) */}
        <div
          onClick={() => setAbrirModal(true)}
          className="cursor-pointer bg-yellow-100/10 text-yellow-400 border border-yellow-400/20 p-4 rounded-xl hover:bg-yellow-100/20 transition space-y-1"
        >
          <ExclamationTriangleIcon className="h-5 w-5 inline mr-1" />
          <strong className="text-yellow-300 block">Pendências:</strong>
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

        {/* Atividades Recentes */}
        <div className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30">
          <h3 className="text-lg font-semibold text-cor-titulo mb-4">
            📝 Atividades Recentes
          </h3>
          <ul className="text-sm text-cor-texto/80 space-y-1">
            <li>✔️ Evento "Roda Cultural" atualizado</li>
            <li>✔️ Foto adicionada por Assistente Maria</li>
            <li>✔️ 2 alunos cadastrados</li>
          </ul>
        </div>
      </div>
      <ModalLembretes
        aberto={abrirModal}
        aoFechar={() => {
          setAbrirModal(false);
          buscarLembretes();
        }}
      />
    </>
  );
}

// COMPONENTES INTERNOS
function CardEstat({ valor, label, Icon, cor }) {
  const cores = {
    green: "bg-green-500/20 text-green-400",
    red: "bg-red-500/20 text-red-400",
    blue: "bg-blue-500/20 text-blue-400",
    amber: "bg-amber-500/20 text-amber-400",
  };
  return (
    <div className="p-4 rounded-xl bg-cor-card border border-cor-secundaria/30 flex items-center gap-4">
      <div className={`p-2 rounded-lg ${cores[cor]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-bold text-cor-titulo">{valor}</p>
        <p className="text-sm text-cor-texto/80">{label}</p>
      </div>
    </div>
  );
}

function BotaoModulo({ to, label }) {
  return (
    <a
      href={to}
      className="bg-cor-card hover:bg-cor-secundaria border border-cor-secundaria/30 text-cor-titulo text-sm font-medium rounded-xl p-4 text-center transition-all"
    >
      {label}
    </a>
  );
}

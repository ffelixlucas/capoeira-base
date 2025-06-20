// src/pages/Dashboard.jsx
import React from 'react';
import {
  UserGroupIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const usuario = { nome: 'Formando Clone' }; // depois pode puxar do contexto

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <div className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30">
        <h2 className="text-2xl font-bold text-cor-titulo">Olá, {usuario.nome}!</h2>
        <p className="text-sm text-cor-texto/80 mt-1">Bem-vindo ao painel de administração</p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <CardEstat valor="24" label="Alunos ativos" Icon={UserGroupIcon} cor="green" />
        <CardEstat valor="5" label="Pendências" Icon={CurrencyDollarIcon} cor="red" />
        <CardEstat valor="3" label="Eventos" Icon={CalendarIcon} cor="blue" />
        <CardEstat valor="12" label="Fotos novas" Icon={PhotoIcon} cor="amber" />
      </div>

      {/* Agenda da Semana */}
      <div className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30">
        <h3 className="text-lg font-semibold text-cor-titulo mb-4">📅 Agenda da Semana</h3>
        <ul className="space-y-2 text-sm text-cor-texto/80">
          <li>• Segunda 19h – Aula Infantil</li>
          <li>• Terça 20h – Roda Cultural</li>
          <li>• Quinta 18h – Aula Adulto</li>
        </ul>
      </div>

      {/* Acesso Rápido */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <BotaoModulo to="/galeria" label="Galeria" />
        <BotaoModulo to="/agenda" label="Eventos" />
        <BotaoModulo to="/alunos" label="Alunos" />
        <BotaoModulo to="/mensalidades" label="Mensalidades" />
        <BotaoModulo to="/uniformes" label="Loja" />
        <BotaoModulo to="/horarios" label="Horários" />
      </div>

      {/* Aviso Interno */}
      <div className="bg-yellow-100/10 text-yellow-400 border border-yellow-400/20 p-4 rounded-xl flex items-start gap-3">
        <ExclamationTriangleIcon className="h-5 w-5 mt-1" />
        <div>
          <strong className="text-yellow-300 block">Lembrete:</strong>
          Levar caixa de som para o evento de sábado.
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="bg-cor-card rounded-2xl p-6 border border-cor-secundaria/30">
        <h3 className="text-lg font-semibold text-cor-titulo mb-4">📝 Atividades Recentes</h3>
        <ul className="text-sm text-cor-texto/80 space-y-1">
          <li>✔️ Evento "Roda Cultural" atualizado</li>
          <li>✔️ Foto adicionada por Assistente Maria</li>
          <li>✔️ 2 alunos cadastrados</li>
        </ul>
      </div>
    </div>
  );
}

// COMPONENTES INTERNOS
function CardEstat({ valor, label, Icon, cor }) {
  const cores = {
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    blue: 'bg-blue-500/20 text-blue-400',
    amber: 'bg-amber-500/20 text-amber-400',
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

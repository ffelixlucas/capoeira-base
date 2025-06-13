import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  CalendarIcon,
  TagIcon,
  VideoCameraIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const DashboardCard = ({ to, icon: Icon, title, subtitle, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Link
        to={to}
        className={`h-full flex flex-col rounded-2xl p-6 bg-cor-card border border-cor-secundaria/30 shadow-sm hover:shadow-glass transition-all duration-300 group`}
      >
        <div className={`mb-4 p-3 rounded-lg ${color} w-fit`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-cor-titulo mb-1">{title}</h3>
        <p className="text-cor-texto/80 text-sm">{subtitle}</p>
        <div className="mt-4 flex justify-end">
          <div className="h-8 w-8 rounded-full bg-cor-secundaria flex items-center justify-center group-hover:bg-cor-primaria transition-colors">
            <svg className="h-4 w-4 text-cor-texto group-hover:text-cor-escura" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const StatCard = ({ value, label, icon: Icon, trend }) => {
  return (
    <div className="rounded-2xl p-5 bg-cor-card border border-cor-secundaria/30">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-cor-texto/80 text-sm">{label}</p>
          <p className="text-2xl font-bold text-cor-titulo mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

function Dashboard() {
  const apps = [
    {
      to: '/galeria',
      icon: PhotoIcon,
      title: 'Galeria',
      subtitle: 'Gerencie fotos e álbuns',
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      to: '/agenda',
      icon: CalendarIcon,
      title: 'Eventos',
      subtitle: 'Calendário de atividades',
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      to: '/uniformes',
      icon: TagIcon,
      title: 'Loja',
      subtitle: 'Produtos e uniformes',
      color: 'bg-amber-500/20 text-amber-400',
    },
    {
      to: '/video-aulas',
      icon: VideoCameraIcon,
      title: 'Aulas',
      subtitle: 'Conteúdo educativo',
      color: 'bg-red-500/20 text-red-400',
    },
    {
      to: '/horarios',
      icon: ClockIcon,
      title: 'Horários',
      subtitle: 'Agenda de treinos',
      color: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      to: '/alunos',
      icon: UserGroupIcon,
      title: 'Alunos',
      subtitle: 'Cadastro e mensalidades',
      color: 'bg-indigo-500/20 text-indigo-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Seção de Estatísticas */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard value="24" label="Alunos Ativos" icon={UserGroupIcon} trend="up" />
        <StatCard value="5" label="Novos Alunos" icon={ChartBarIcon} trend="up" />
        <StatCard value="3" label="Eventos" icon={CalendarIcon} trend="down" />
        <StatCard value="92%" label="Presença" icon={CogIcon} trend="up" />
      </motion.div>

      {/* Seção Principal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-cor-titulo mb-6">Módulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app, index) => (
            <DashboardCard
              key={app.to}
              to={app.to}
              icon={app.icon}
              title={app.title}
              subtitle={app.subtitle}
              color={app.color}
              index={index}
            />
          ))}
        </div>
      </motion.div>

      {/* Seção de Atividades Recentes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold text-cor-titulo mb-6">Atividades Recentes</h2>
        <div className="rounded-2xl bg-cor-card border border-cor-secundaria/30 p-6">
          {/* Conteúdo das atividades */}
          <p className="text-cor-texto/80">Nenhuma atividade recente</p>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
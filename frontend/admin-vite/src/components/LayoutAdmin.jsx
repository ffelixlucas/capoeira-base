import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  PhotoIcon,
  CalendarIcon,
  TagIcon,
  VideoCameraIcon,
  ClockIcon,
  UserGroupIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

function NavItem({ to, label, Icon, onClick, isActive }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center space-x-3 rounded-xl p-4 transition-all duration-200 ${
        isActive 
          ? 'bg-cor-primaria/20 text-cor-titulo border-l-4 border-cor-primaria'
          : 'text-cor-texto hover:bg-cor-secundaria'
      }`}
      aria-label={label}
    >
      <div className={`p-2 rounded-lg ${
        isActive 
          ? 'bg-cor-primaria text-cor-escura'
          : 'bg-cor-secundaria text-cor-primaria'
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function LayoutAdmin() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleMenu = () => setMenuAberto((prev) => !prev);

  const navItems = [
    { to: '/dashboard', label: 'Início', Icon: HomeIcon },
    { to: '/galeria', label: 'Galeria', Icon: PhotoIcon },
    { to: '/agenda', label: 'Eventos', Icon: CalendarIcon },
    { to: '/uniformes', label: 'Loja', Icon: TagIcon },
    { to: '/video-aulas', label: 'Aulas', Icon: VideoCameraIcon },
    { to: '/horarios', label: 'Horários', Icon: ClockIcon },
    { to: '/alunos', label: 'Alunos', Icon: UserGroupIcon },
  ];

  return (
    <div className="flex min-h-screen bg-cor-fundo text-cor-texto">
      {/* MENU LATERAL - ESTILO MODERNO */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-cor-secundaria/90 backdrop-blur-xs p-6 shadow-2xl transition-transform duration-300 ease-in-out sm:static sm:block sm:translate-x-0 ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu de navegação"
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cor-primaria text-cor-escura">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-cor-titulo">Capoeira</h3>
            </div>
            <button
              className="text-cor-texto sm:hidden"
              onClick={toggleMenu}
              aria-label="Fechar menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navegação */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                Icon={item.Icon}
                onClick={() => setMenuAberto(false)}
                isActive={location.pathname === item.to}
              />
            ))}
          </nav>

          {/* Rodapé */}
          <div className="mt-auto pt-4 border-t border-cor-secundaria">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-cor-texto/80">
                <p>Olá, {usuario?.nome || 'Usuário'}!</p>
                <p className="text-xs">Administrador</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-cor-primaria flex items-center justify-center text-cor-escura font-bold">
                {usuario?.nome?.charAt(0) || 'U'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 rounded-lg px-4 py-3 text-red-400 hover:bg-red-400/10 transition-colors"
              aria-label="Sair do sistema"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between bg-cor-secundaria/50 backdrop-blur-xs p-4 sm:p-6 border-b border-cor-secundaria">
          <h2 className="text-xl font-semibold text-cor-titulo">
            {navItems.find(item => item.to === location.pathname)?.label || 'Painel'}
          </h2>
          <button
            className="rounded-lg p-2 text-cor-texto hover:bg-cor-secundaria sm:hidden"
            onClick={toggleMenu}
            aria-label="Abrir menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto bg-cor-fundo/50 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default LayoutAdmin;
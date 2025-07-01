// LayoutAdmin.jsx
import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { usePermissao } from "../../hooks/usePermissao";
import {
  PhotoIcon,
  CalendarIcon,
  TagIcon,
  VideoCameraIcon,
  ClockIcon,
  UserGroupIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import logo from "../../assets/images/logo.png";

function NavItem({ to, label, Icon, onClick, isActive }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group flex items-center space-x-3 rounded-xl p-4 transition ${
        isActive
          ? "bg-cor-primaria/20 text-cor-titulo border-l-4 border-cor-primaria"
          : "text-cor-texto hover:bg-cor-secundaria"
      }`}
    >
      <div
        className={`p-2 rounded-lg ${
          isActive
            ? "bg-cor-primaria text-cor-escura"
            : "bg-cor-secundaria text-cor-primaria"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function LayoutAdmin() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const { temPapel } = usePermissao();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleMenu = () => setMenuAberto(!menuAberto);

  const todosItens = [
    { to: "/dashboard", label: "Início", Icon: HomeIcon, roles: [] },
    { to: "/equipe", label: "Equipe", Icon: UserGroupIcon, roles: ["admin"] },
    {
      to: "/galeria",
      label: "Galeria",
      Icon: PhotoIcon,
      roles: ["admin", "midia"],
    },
    {
      to: "/agenda",
      label: "Eventos",
      Icon: CalendarIcon,
      roles: ["admin", "instrutor"],
    },
    {
      to: "/uniformes",
      label: "Loja",
      Icon: TagIcon,
      roles: ["admin", "loja"],
    },
    {
      to: "/video-aulas",
      label: "Aulas",
      Icon: VideoCameraIcon,
      roles: ["admin", "instrutor", "midia"],
    },
    {
      to: "/horarios",
      label: "Horários",
      Icon: ClockIcon,
      roles: ["admin", "instrutor"],
    },
    { to: "/alunos", label: "Alunos", Icon: UserGroupIcon, roles: ["admin"] },
  ];

  const navItems = todosItens.filter(
    (item) => item.roles.length === 0 || temPapel(item.roles)
  );

  return (
    <div className="flex bg-cor-fundo text-cor-texto">
      {/* ============== MENU ============== */}
      {/* Mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 bg-cor-secundaria/95 p-6 flex flex-col w-72 overflow-y-auto">
        <div className="flex justify-center mb-6 relative">
            <div className="w-20 h-20">
              <img
                src={logo}
                alt="Ícone Capoeira"
                className="w-full h-full object-contain"
              />
            </div>
            <button onClick={toggleMenu} className="absolute right-0 top-1">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={item.label}
                Icon={item.Icon}
                onClick={toggleMenu}
                isActive={location.pathname === item.to}
              />
            ))}
          </nav>
          <div className="border-t border-cor-secundaria pt-4 shrink-0">
          <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 rounded-lg px-4 py-3 text-red-400 hover:bg-red-400/10 transition"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop */}
      <aside className="hidden sm:flex flex-col w-72 h-screen fixed left-0 top-0 z-40 bg-cor-secundaria/90 backdrop-blur-md p-6">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24">
            <img
              src={logo}
              alt="Ícone Capoeira"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              Icon={item.Icon}
              onClick={() => {}}
              isActive={location.pathname === item.to}
            />
          ))}
        </nav>
        <div className="border-t border-cor-secundaria pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 rounded-lg px-4 py-3 text-red-400 hover:bg-red-400/10 transition"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ============ CONTEÚDO PRINCIPAL ============ */}
      <div className="flex flex-col flex-1 sm:ml-72 min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between bg-cor-secundaria/50 backdrop-blur p-4 sm:p-6 border-b border-cor-secundaria">
          <h2 className="text-xl font-semibold text-cor-titulo">
            {navItems.find((item) => item.to === location.pathname)?.label ||
              "Painel"}
          </h2>
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-cor-secundaria"
            onClick={toggleMenu}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 bg-cor-fundo p-4 sm:p-6">
          <div className="w-full max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default LayoutAdmin;

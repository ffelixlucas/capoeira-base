// LayoutAdmin.jsx
import React, { useState } from "react";
import {
  Link,
  Outlet,
  useNavigate,
  useLocation,
  matchPath,
} from "react-router-dom";
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

// 🔹 NOVO: Back e meta das rotas
import BackButton from "./BackButton";
import { routeMeta } from "../../routes/routeMeta";
import { useRouteHistory } from "../../hooks/useRouteHistory";

import { solicitarPermissaoNotificacoes } from "../../utils/notifications";
import { registrarPushSubscription } from "../../utils/pushManager";


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
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const { temPapel } = usePermissao();

// 🔹 Pede permissão apenas uma vez
React.useEffect(() => {
  solicitarPermissaoNotificacoes();
}, []);

// 🔹 Registra push SOMENTE quando o usuário existir
React.useEffect(() => {
  if (!usuario?.id || !usuario?.organizacao_id) return;

  registrarPushSubscription(usuario)
    .then((sub) => console.log("Subscription registrada:", sub))
    .catch((err) => console.error("Erro ao registrar push:", err));
}, [usuario]);

  

  // 🔹 registra cada navegação dentro do admin
  useRouteHistory(location.pathname);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleMenu = () => setMenuAberto(!menuAberto);

  const todosItens = [
    { to: "/dashboard", label: "Início", Icon: HomeIcon, roles: [] },
    { to: "/alunos", label: "Alunos", Icon: UserGroupIcon, roles: ["admin"] },
    { to: "/turmas", label: "Turmas", Icon: UserGroupIcon, roles: ["admin"] },

    {
      to: "/agenda",
      label: "Eventos",
      Icon: CalendarIcon,
      roles: ["admin", "instrutor"],
    },
    {
      to: "/galeria",
      label: "Galeria",
      Icon: PhotoIcon,
      roles: ["admin", "midia"],
    },
    { to: "/equipe", label: "Equipe", Icon: UserGroupIcon, roles: ["admin"] },
    {
      to: "/uniformes",
      label: "Loja",
      Icon: TagIcon,
      roles: ["admin", "loja"],
    },
    {
      to: "/horarios",
      label: "Horários de aulas",
      Icon: ClockIcon,
      roles: ["admin", "instrutor"],
    },
    {
      to: "/video-aulas",
      label: "Aulas",
      Icon: VideoCameraIcon,
      roles: ["admin", "instrutor", "midia"],
    },
  ];

  const navItems = todosItens.filter(
    (item) => item.roles.length === 0 || temPapel(item.roles)
  );

  // 🔹 NOVO: Título baseado no pattern (suporta rotas com :params)
  const getTitle = () => {
    for (const meta of routeMeta) {
      if (matchPath({ path: meta.pattern, end: true }, location.pathname)) {
        return meta.title;
      }
    }
    // fallback antigo por compatibilidade
    return (
      navItems.find((item) => item.to === location.pathname)?.label || "Painel"
    );
  };

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
          <div className="flex items-center gap-3">
            {/* 🔹 NOVO: Back sempre visível (mobile-first) */}
            <BackButton />
            <h2 className="text-xl font-semibold text-cor-titulo">
              {getTitle()}
            </h2>
          </div>
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

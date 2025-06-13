import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LayoutAdmin() {
  const [menuAberto, setMenuAberto] = useState(false);
  const { logout, usuario } = useAuth();

  const navigate = useNavigate(); 

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true }); 
  };
  
  const toggleMenu = () => setMenuAberto((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-cor-fundo text-cor-texto">
      {/* MENU LATERAL */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-cor-secundaria p-6 transition-transform duration-300 ease-in-out sm:static sm:block sm:translate-x-0 sm:w-64 ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu de navegação"
      >
        {/* Cabeçalho do menu */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-cor-titulo">Menu</h3>
          <button
            className="text-cor-texto sm:hidden"
            onClick={toggleMenu}
            aria-label="Fechar menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex flex-col space-y-3">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/galeria', label: 'Galeria' },
            { to: '/agenda', label: 'Agenda' },
            { to: '/alunos', label: 'Alunos' },
            { to: '/mensalidades', label: 'Mensalidades' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-cor-texto transition-colors hover:bg-cor-destaque hover:text-cor-clara"
              onClick={() => setMenuAberto(false)} // Fecha o menu ao clicar em mobile
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-2 text-left text-red-400 transition-colors hover:bg-cor-destaque hover:text-cor-clara"
            aria-label="Sair do sistema"
          >
            Sair
          </button>
        </nav>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-cor-secundaria p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-cor-titulo sm:text-xl">
            Bem-vindo, {usuario?.nome || 'Usuário'}
          </h2>
          <button
            className="rounded-md bg-cor-primaria px-3 py-1 text-cor-escura sm:hidden"
            onClick={toggleMenu}
            aria-label="Abrir menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LayoutAdmin;
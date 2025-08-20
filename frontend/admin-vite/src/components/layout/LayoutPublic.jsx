// components/layout/LayoutPublic.jsx
import React from "react";
import { Outlet, Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";

function LayoutPublic() {
  return (
    <div className="flex flex-col min-h-screen bg-cor-fundo text-cor-texto">
      {/* Header simples com logo */}
      <header className="w-full bg-cor-secundaria p-4 flex justify-center border-b border-cor-secundaria">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Logo Capoeira Base"
            className="h-28 w-28 object-contain"
          />
          <span className="font-semibold text-lg text-cor-titulo">
          </span>
        </Link>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 w-full max-w-[800px] mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      {/* Rodapé simples */}
      <footer className="w-full bg-cor-secundaria p-4 text-center text-sm text-cor-texto/80">
        © {new Date().getFullYear()} Capoeira Base – Todos os direitos reservados
      </footer>
    </div>
  );
}

export default LayoutPublic;

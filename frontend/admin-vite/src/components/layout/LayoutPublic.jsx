import React from "react";
import { Outlet } from "react-router-dom";

function LayoutPublic() {
  return (
    <div className="flex flex-col min-h-screen bg-cor-fundo text-cor-texto">
      <main className="flex-1 w-full max-w-[800px] mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      <footer className="w-full bg-cor-secundaria p-4 text-center text-sm text-cor-texto/80">
        © {new Date().getFullYear()} Capoeira Base
      </footer>
    </div>
  );
}

export default LayoutPublic;

import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LayoutAdmin() {
  const [aberto, setAberto] = useState(true);
  const { logout, usuario } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* MENU LATERAL */}
      <aside style={{ width: aberto ? '200px' : '60px', background: '#eee', minHeight: '100vh' }}>
        <button onClick={() => setAberto(!aberto)}>
          {aberto ? 'Fechar' : 'Abrir'}
        </button>
        {aberto && (
          <nav>
            <ul>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/galeria">Galeria</Link></li>
              <li><Link to="/agenda">Agenda</Link></li>
              <li><Link to="/alunos">Alunos</Link></li>
              <li><Link to="/mensalidades">Mensalidades</Link></li>
              <li><button onClick={handleLogout}>Sair</button></li>
            </ul>
          </nav>
        )}
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, padding: '20px' }}>
        <header style={{ marginBottom: '20px' }}>
          <h2>Bem-vindo, {usuario?.nome}</h2>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutAdmin;

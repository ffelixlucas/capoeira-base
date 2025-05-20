import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Bem-vindo, {usuario?.nome}</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sair
      </button>
    </div>
  );
}

export default Dashboard;

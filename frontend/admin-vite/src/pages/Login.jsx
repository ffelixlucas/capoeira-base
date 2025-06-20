import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function Login() {
  const { login, isAutenticado } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  // ✅ Se já estiver logado, redireciona pro dashboard automaticamente
  useEffect(() => {
    if (isAutenticado()) {
      navigate('/dashboard');
    }
  }, [isAutenticado, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const resultado = await login(email, senha);

    if (resultado.sucesso) {
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } else {
      toast.error(resultado.mensagem || 'Erro ao fazer login');
    }

    setCarregando(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cor-fundo">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-80"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-cor-titulo">
          Login
        </h2>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-cor-primaria"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-6 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-cor-primaria"
          required
        />

        <button
          type="submit"
          disabled={carregando}
          className={`w-full ${
            carregando ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } text-white py-2 rounded transition-all`}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default Login;

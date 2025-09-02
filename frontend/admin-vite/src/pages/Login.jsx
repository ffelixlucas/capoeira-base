import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import logo from "../assets/images/logo.png";

function Login() {
  const { login, isAutenticado } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const resultado = await login(email, senha);

    if (resultado.sucesso) {
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } else {
      toast.error(resultado.mensagem || "Erro ao fazer login");
    }

    setCarregando(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cor-fundo p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="CN10 Capoeira" className="h-32 object-contain" />
        </div>

        <div className="bg-cor-secundaria rounded-2xl shadow-xl overflow-hidden border border-cor-primaria/20">
          <div className="bg-cor-primaria py-3 px-6">
            <h2 className="text-xl font-bold text-cor-escura text-center">
              Acesso ao Sistema
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-cor-clara mb-1"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-cor-fundo border border-cor-primaria/30 text-cor-texto placeholder-cor-primaria/50 focus:outline-none focus:ring-2 focus:ring-cor-primaria focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-cor-clara mb-1"
              >
                Senha
              </label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-cor-fundo border border-cor-primaria/30 text-cor-texto placeholder-cor-primaria/50 focus:outline-none focus:ring-2 focus:ring-cor-primaria focus:border-transparent"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={carregando}
                className={`w-full flex justify-center items-center gap-2 ${
                  carregando
                    ? "bg-cor-primaria/70"
                    : "bg-cor-primaria hover:bg-cor-destaque"
                } text-cor-escura font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg`}
              >
                {carregando ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-cor-escura"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-cor-primaria hover:underline"
          >
            Esqueceu sua senha?
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

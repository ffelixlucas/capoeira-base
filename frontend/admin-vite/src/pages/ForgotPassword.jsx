import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../services/authService";
import { toast } from "react-toastify";
import InputBase from "../components/ui/InputBase";
import { logger } from "../utils/logger";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu e-mail");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      toast.success("Se o e-mail existir, você receberá um link de redefinição.");
      navigate("/login");
    } catch (err) {
      logger.error(err);
      toast.error("Erro ao solicitar redefinição, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center text-black mb-2">
          Recuperar acesso
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputBase
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-blue-600 hover:underline"
          >
            Voltar para login
          </button>
        </div>
      </div>
    </div>
  );
}

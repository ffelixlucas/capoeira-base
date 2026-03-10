import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { useFamilyAuth } from "../../../hooks/useFamilyAuth";

function formatarCpf(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

export default function FamiliaLogin() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { autenticado, usuario, loginComFirebase } = useFamilyAuth();
  const [cpf, setCpf] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (autenticado && usuario?.slug === slug) {
      navigate(`/familia/${slug}`, { replace: true });
    }
  }, [autenticado, usuario, slug, navigate]);

  if (autenticado && usuario?.slug === slug) {
    return <Navigate to={`/familia/${slug}`} replace />;
  }

  async function handleEntrar() {
    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      toast.error("Informe um CPF válido para acessar o portal do aluno.");
      return;
    }

    setCarregando(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const credencial = await signInWithPopup(auth, provider);
      const firebaseToken = await credencial.user.getIdToken(true);

      await loginComFirebase({
        slug,
        cpf: cpfLimpo,
        firebaseToken,
      });

      toast.success("Acesso liberado com sucesso.");
      navigate(`/familia/${slug}`, { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Não foi possível entrar no portal do aluno."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Portal do Aluno
          </p>
          <h1 className="text-2xl font-black text-slate-900">
            Acesso do responsável
          </h1>
          <p className="text-sm text-slate-600">
            Entre com sua conta Firebase e confirme o CPF do responsável para
            acessar o portal.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          MVP inicial: o painel ainda não exibe dados do aluno nem mensalidades.
          Nesta fase estamos garantindo o acesso do responsável.
        </div>

        <div className="space-y-2">
          <label htmlFor="cpf_familia" className="text-sm font-medium text-slate-700">
            CPF do responsável
          </label>
          <input
            id="cpf_familia"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(formatarCpf(e.target.value))}
            placeholder="000.000.000-00"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </div>

        <button
          type="button"
          onClick={handleEntrar}
          disabled={carregando}
          className="flex w-full items-center justify-center rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
        >
          {carregando ? "Entrando..." : "Entrar com Firebase"}
        </button>
      </div>
    </section>
  );
}

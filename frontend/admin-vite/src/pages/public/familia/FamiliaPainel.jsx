import React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useFamilyAuth } from "../../../hooks/useFamilyAuth";
import {
  listarAlunosFamilia,
  atualizarAlunoFamilia,
} from "../../../services/familiaPortalService";
import FamiliaAlunoCard from "../../../components/public/familia/FamiliaAlunoCard";
import FamiliaAvaliacaoMock from "../../../components/public/familia/FamiliaAvaliacaoMock";
import FamiliaMensalidadesMock from "../../../components/public/familia/FamiliaMensalidadesMock";

export default function FamiliaPainel() {
  const { logout } = useFamilyAuth();
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("mensalidades");

  useEffect(() => {
    listarAlunosFamilia()
      .then(setAlunos)
      .catch((err) => {
        toast.error(
          err?.response?.data?.error ||
            err?.message ||
            "Não foi possível carregar os alunos vinculados."
        );
      })
      .finally(() => setCarregando(false));
  }, []);

  async function handleSalvarAluno(alunoId, payload) {
    const atualizado = await atualizarAlunoFamilia(alunoId, payload);

    setAlunos((prev) =>
      prev.map((aluno) => (aluno.id === alunoId ? atualizado : aluno))
    );

    toast.success("Dados do aluno atualizados com sucesso.");
  }

  return (
    <section className="overflow-hidden rounded-[32px] border border-stone-200 bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_40%,#f8fafc_100%)] shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-5">
          {carregando ? (
            <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5 text-sm text-slate-600">
              Carregando alunos vinculados...
            </div>
          ) : alunos.length === 0 ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
              Nenhum aluno vinculado a este CPF por enquanto. Para aparecer
              aqui, o cadastro do aluno precisa ter o mesmo
              `responsavel_documento`.
            </div>
          ) : (
            <div className="space-y-5">
              {alunos.map((aluno) => (
                <FamiliaAlunoCard
                  key={aluno.id}
                  aluno={aluno}
                  onSalvar={handleSalvarAluno}
                />
              ))}
            </div>
          )}

          {alunos.length > 0 ? (
            <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white">
              <div className="border-b border-stone-200 px-4 py-3 sm:px-5">
                <div className="inline-flex rounded-2xl border border-stone-200 bg-stone-50 p-1">
                  <button
                    type="button"
                    onClick={() => setAbaAtiva("mensalidades")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      abaAtiva === "mensalidades"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-stone-500 hover:text-slate-700"
                    }`}
                  >
                    Mensalidades
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbaAtiva("aluno")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      abaAtiva === "aluno"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-stone-500 hover:text-slate-700"
                    }`}
                  >
                    Aluno
                  </button>
                </div>
              </div>

              <div className="p-0">
                {abaAtiva === "mensalidades" ? (
                  <FamiliaMensalidadesMock alunos={alunos} />
                ) : (
                  <FamiliaAvaliacaoMock alunos={alunos} />
                )}
              </div>
            </div>
          ) : null}

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 sm:w-auto sm:min-w-[180px]"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

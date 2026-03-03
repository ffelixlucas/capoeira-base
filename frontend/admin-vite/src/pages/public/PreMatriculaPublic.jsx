// src/pages/public/PreMatriculaPublic.jsx
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { usePreMatricula } from "../../hooks/public/usePreMatricula";
import { usePreMatriculaSteps } from "../../hooks/public/usePreMatriculaSteps";
import ModalFicha from "../../components/ui/ModalFicha";
import PoliticaLGPD from "../../docs/politicaLGPD";
import { User, Shield, Home, FileText, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import StepAluno from "../../components/public/PreMatricula/StepAluno";
import StepResponsavel from "../../components/public/PreMatricula/StepResponsavel";
import StepContato from "../../components/public/PreMatricula/StepContato";
import StepAutorizacoes from "../../components/public/PreMatricula/StepAutorizacoes";
import { calcularIdade } from "../../utils/formatters";
import { toast } from "react-toastify";
import { usePublicSiteUrl } from "../../hooks/public/loja/usePublicSiteUrl";

function StepChip({ ativo, concluido, label, Icon }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
        ativo
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700"
          : concluido
          ? "border-emerald-400/30 bg-emerald-500/5 text-emerald-700/90"
          : "border-gray-200 bg-white text-gray-500"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

export default function PreMatriculaPublic() {
  const { slug } = useParams();
  const { registrarPreMatricula, carregando, sucesso } = usePreMatricula();
  const siteUrl = usePublicSiteUrl(slug);
  const [mostrarLGPD, setMostrarLGPD] = useState(false);
  const [fotoPendente, setFotoPendente] = useState(false);

  const {
    step,
    form,
    possuiRestricao,
    setPossuiRestricao,
    handleChange,
    nextStep,
    prevStep,
    handleSubmit,
  } = usePreMatriculaSteps(registrarPreMatricula, slug);

  const [cpfInvalido, setCpfInvalido] = useState(false);
  const idade = calcularIdade(form.nascimento);

  const stepsInfo =
    idade < 18
      ? [
          { icon: User, label: "Aluno" },
          { icon: Shield, label: "Responsável" },
          { icon: Home, label: "Contato" },
          { icon: FileText, label: "Autorizações" },
        ]
      : [
          { icon: User, label: "Aluno" },
          { icon: Home, label: "Contato" },
          { icon: FileText, label: "Autorizações" },
        ];

  const progresso = useMemo(() => {
    if (!stepsInfo.length) return 0;
    return Math.round((step / stepsInfo.length) * 100);
  }, [step, stepsInfo.length]);

  // ✅ Sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cor-fundo via-cor-fundo to-cor-fundo/90 p-4 sm:p-6">
        <div className="mx-auto max-w-xl pt-10">
          <div className="rounded-3xl border border-emerald-500/30 bg-white p-6 sm:p-8 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Pré-matrícula enviada
            </h1>
            <p className="mt-3 text-gray-600 leading-relaxed">{sucesso}</p>
            <p className="mt-2 text-sm text-gray-500">
              Agora é só aguardar a confirmação da equipe.
            </p>

            <a
              href={siteUrl}
              className="mt-6 inline-flex min-h-[46px] items-center justify-center rounded-xl border border-gray-300 px-5 font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Voltar para o site
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cor-fundo via-cor-fundo to-cor-fundo/90 px-4 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/90 px-4 py-3 shadow-lg backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Capoeira Nota 10</p>
            <h1 className="text-lg sm:text-xl font-black text-gray-900">Pré-Matrícula Online</h1>
          </div>

          <a
            href={siteUrl}
            className="inline-flex min-h-[40px] items-center rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Voltar para o site
          </a>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-4 sm:p-6 shadow-2xl">
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
              <span>Etapa {step} de {stepsInfo.length}</span>
              <span>{progresso}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {stepsInfo.map((item, index) => {
              const indexStep = index + 1;
              const ativo = indexStep === step;
              const concluido = indexStep < step;

              return (
                <StepChip
                  key={item.label}
                  ativo={ativo}
                  concluido={concluido}
                  label={item.label}
                  Icon={item.icon}
                />
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
            {step === 1 && (
              <StepAluno
                form={form}
                handleChange={handleChange}
                fotoPendente={fotoPendente}
                setFotoPendente={setFotoPendente}
                onCpfInvalido={setCpfInvalido}
              />
            )}

            {step === 2 && idade < 18 && (
              <StepResponsavel form={form} handleChange={handleChange} />
            )}

            {(step === 2 && idade >= 18) || (step === 3 && idade < 18) ? (
              <StepContato
                form={form}
                handleChange={handleChange}
                possuiRestricao={possuiRestricao}
                setPossuiRestricao={setPossuiRestricao}
              />
            ) : null}

            {(step === 3 && idade >= 18) || (step === 4 && idade < 18) ? (
              <StepAutorizacoes
                form={form}
                handleChange={handleChange}
                setMostrarLGPD={setMostrarLGPD}
              />
            ) : null}

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-gray-300 px-4 font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </button>
              ) : (
                <span />
              )}

              {step < stepsInfo.length && (
                <button
                  type="button"
                  disabled={step === 1 && cpfInvalido}
                  onClick={() => {
                    if (step === 1 && cpfInvalido) {
                      toast.error("Este CPF já está cadastrado. Corrija antes de continuar.");
                      return;
                    }

                    if (step === 1 && fotoPendente) {
                      toast.warn("Confirme a foto antes de prosseguir.");
                      return;
                    }

                    nextStep();
                  }}
                  className={`inline-flex min-h-[46px] items-center gap-2 rounded-xl px-5 font-semibold text-white transition ${
                    step === 1 && cpfInvalido
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}

              {step === stepsInfo.length && (
                <button
                  type="submit"
                  disabled={carregando}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-emerald-600 px-5 font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {carregando ? "Enviando..." : "Enviar pré-matrícula"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <ModalFicha
        aberto={mostrarLGPD}
        onClose={() => setMostrarLGPD(false)}
        titulo="Política de Privacidade (LGPD)"
      >
        <PoliticaLGPD contexto="matricula" organization="Espaço Cultural CN10" />
      </ModalFicha>
    </div>
  );
}

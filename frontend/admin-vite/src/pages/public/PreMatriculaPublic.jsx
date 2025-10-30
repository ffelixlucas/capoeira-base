// src/pages/public/PreMatriculaPublic.jsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePreMatricula } from "../../hooks/public/usePreMatricula";
import { usePreMatriculaSteps } from "../../hooks/public/usePreMatriculaSteps";
import ModalFicha from "../../components/ui/ModalFicha";
import PoliticaLGPD from "../../docs/politicaLGPD";
import { User, Shield, Home, FileText } from "lucide-react";
import StepAluno from "../../components/public/PreMatricula/StepAluno";
import StepResponsavel from "../../components/public/PreMatricula/StepResponsavel";
import StepContato from "../../components/public/PreMatricula/StepContato";
import StepAutorizacoes from "../../components/public/PreMatricula/StepAutorizacoes";
import { calcularIdade } from "../../utils/formatters";
import { toast } from "react-toastify";

export default function PreMatriculaPublic() {
  const { slug } = useParams();
  const { registrarPreMatricula, carregando, sucesso } = usePreMatricula();
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

  // ✅ Sucesso (pré-matrícula enviada)
  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-cor-fundo">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-green-600 mb-3">
            ✅ Pré-matrícula enviada!
          </h1>
          <p className="text-gray-700">{sucesso}</p>
          <p className="text-gray-600 mt-2">
            A administração entrará em contato após a análise.
          </p>
        </div>
      </div>
    );
  }

  // 🧾 Formulário principal
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cor-fundo">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-black mb-4">
          Pré-Matrícula Online
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-gray-800">
          {step === 1 && (
            <StepAluno
              form={form}
              handleChange={handleChange}
              fotoPendente={fotoPendente}
              setFotoPendente={setFotoPendente}
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

          {/* Navegação */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn-light">
                Anterior
              </button>
            )}

            {step < stepsInfo.length && (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && fotoPendente) {
                    toast.warn("Confirme a foto antes de prosseguir.");
                    return;
                  }
                  nextStep();
                }}
                className="btn-primary ml-auto"
              >
                Próximo
              </button>
            )}

            {step === stepsInfo.length && (
              <button
                type="submit"
                className="btn-primary ml-auto"
                disabled={carregando}
              >
                {carregando ? "Enviando..." : "Enviar pré-matrícula"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Modal LGPD */}
      <ModalFicha
        aberto={mostrarLGPD}
        onClose={() => setMostrarLGPD(false)}
        titulo="Política de Privacidade (LGPD)"
      >
        <PoliticaLGPD
          contexto="matricula"
          organization="Espaço Cultural CN10"
        />
      </ModalFicha>
    </div>
  );
}

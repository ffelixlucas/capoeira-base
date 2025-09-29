// src/pages/public/MatriculaPublic.jsx
import { useState } from "react";
import { useMatricula } from "../../hooks/public/useMatricula";
import { useMatriculaSteps } from "../../hooks/public/useMatriculaSteps";
import ModalFicha from "../../components/ui/ModalFicha";
import PoliticaLGPD from "../../docs/politicaLGPD";
import CardEstat from "../../components/ui/CardEstat";
import { User, Shield, Home, FileText } from "lucide-react";
import StepAluno from "../../components/public/matricula/StepAluno";
import StepResponsavel from "../../components/public/matricula/StepResponsavel";
import StepContato from "../../components/public/matricula/StepContato";
import StepAutorizacoes from "../../components/public/matricula/StepAutorizacoes";
import { calcularIdade } from "../../utils/formatters";

export default function MatriculaPublic() {
  const { registrarMatricula, carregando, sucesso } = useMatricula();
  const [mostrarLGPD, setMostrarLGPD] = useState(false);

  const {
    step,
    form,
    possuiRestricao,
    setPossuiRestricao,
    handleChange,
    nextStep,
    prevStep,
    handleSubmit,
  } = useMatriculaSteps(registrarMatricula);

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

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-cor-fundo">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-green-600 mb-3">
            ✅ Matrícula enviada!
          </h1>
          <p className="text-gray-700">{sucesso}</p>
          <p className="text-gray-600 mt-2">
            A administração entrará em contato após a análise.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cor-fundo">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center text-black mb-4">
          Matrícula Online
        </h1>


        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-gray-800">
          {step === 1 && <StepAluno form={form} handleChange={handleChange} />}
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
                onClick={nextStep}
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
                {carregando ? "Enviando..." : "Enviar matrícula"}
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

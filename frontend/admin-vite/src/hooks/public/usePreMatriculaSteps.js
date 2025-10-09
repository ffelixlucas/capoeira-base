// src/hooks/public/usePreMatriculaSteps.js
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";
import {
  formatarCPF,
  formatarTelefone,
  limparNumeros,
  validarEmail,
  calcularIdade,
} from "../../utils/formatters";

export function usePreMatriculaSteps(registrarPreMatricula) {
  const [step, setStep] = useState(1);
  const [possuiRestricao, setPossuiRestricao] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    nascimento: "",
    cpf: "",
    email: "",
    nome_responsavel: "",
    responsavel_documento: "",
    responsavel_parentesco: "",
    telefone_responsavel: "",
    telefone_aluno: "",
    endereco: "",
    observacoes_medicas: "",
    autorizacao_imagem: false,
    aceite_lgpd: false,
    ja_treinou: null,
    grupo_origem: "",
    grupo_personalizado: "",
  });

  // Atualiza os valores digitados
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let novoValor = value;

    if (name === "cpf" || name === "responsavel_documento") {
      novoValor = formatarCPF(value);
    }
    if (name === "telefone_responsavel" || name === "telefone_aluno") {
      novoValor = formatarTelefone(value);
    }
    if (name === "email") {
      novoValor = value.toLowerCase();
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : novoValor,
    }));
  }

  // Validação de cada etapa
  function validarStep() {
    const idade = calcularIdade(form.nascimento);

    if (step === 1) {
      if (!form.nome || !form.nascimento || !form.cpf || !form.ja_treinou) {
        toast.error("Preencha todos os campos obrigatórios do passo 1");
        return false;
      }
      if (form.cpf.replace(/\D/g, "").length !== 11) {
        toast.error("CPF inválido");
        return false;
      }
      if (form.ja_treinou === "sim" && !form.grupo_origem) {
        toast.error("Informe o grupo de capoeira");
        return false;
      }
    }

    if (step === 2 && idade < 18) {
      if (
        !form.nome_responsavel ||
        !form.responsavel_documento ||
        !form.responsavel_parentesco ||
        !form.telefone_responsavel
      ) {
        toast.error("Preencha todos os campos do responsável");
        return false;
      }
    }

    if ((step === 2 && idade >= 18) || (step === 3 && idade < 18)) {
      if (!form.email || !validarEmail(form.email)) {
        toast.error("Informe um e-mail válido");
        return false;
      }
      if (idade >= 18 && !form.telefone_aluno) {
        toast.error("Informe o telefone do aluno");
        return false;
      }
      if (idade < 18 && !form.telefone_responsavel) {
        toast.error("Informe o telefone do responsável");
        return false;
      }
    }

    if ((step === 3 && idade >= 18) || (step === 4 && idade < 18)) {
      if (!form.aceite_lgpd) {
        toast.error("Você precisa aceitar a política de privacidade (LGPD)");
        return false;
      }
    }

    return true;
  }

  function nextStep() {
    if (validarStep()) setStep((s) => s + 1);
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  // Submissão final
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validarStep()) return;

    const idade = calcularIdade(form.nascimento);

    // Monta payload conforme backend pre_matriculas
    const payload = {
      organizacao_id: 1, // por enquanto fixo
      nome: form.nome,
      nascimento: form.nascimento,
      cpf: limparNumeros(form.cpf),
      email: form.email.toLowerCase(),
      telefone:
        idade >= 18
          ? limparNumeros(form.telefone_aluno)
          : limparNumeros(form.telefone_responsavel),
      ja_treinou: form.ja_treinou, 

      grupo_origem:
        form.grupo_origem === "Outros"
          ? form.grupo_personalizado
          : form.grupo_origem,
      observacoes_medicas: possuiRestricao ? form.observacoes_medicas : null,
      autorizacao_imagem: form.autorizacao_imagem,
      aceite_lgpd: form.aceite_lgpd,
    };

    logger.info("[usePreMatriculaSteps] Enviando payload", payload);
    await registrarPreMatricula(payload);
  }

  return {
    step,
    form,
    possuiRestricao,
    setPossuiRestricao,
    handleChange,
    nextStep,
    prevStep,
    handleSubmit,
  };
}

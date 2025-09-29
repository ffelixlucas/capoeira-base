// src/hooks/public/useMatriculaSteps.js
import { useState } from "react";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";
import {
  formatarCPF,
  formatarTelefone,
  limparNumeros,
  validarEmail,
  calcularIdade,
} from "../../utils/formatters";

export function useMatriculaSteps(registrarMatricula) {
  const [step, setStep] = useState(1);
  const [possuiRestricao, setPossuiRestricao] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    apelido: "",
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
    grupo: "",
    graduacao: "",
  });

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

  function validarStep() {
    const idade = calcularIdade(form.nascimento);

    // Step 1 - Dados básicos do aluno
    if (step === 1) {
      if (!form.nome || !form.nascimento || !form.cpf || !form.ja_treinou) {
        toast.error("Preencha todos os campos obrigatórios do passo 1");
        return false;
      }
      if (form.cpf.replace(/\D/g, "").length !== 11) {
        toast.error("CPF inválido");
        return false;
      }
      if (
        form.ja_treinou === "sim" &&
        form.grupo.toLowerCase().includes("capoeira brasil") &&
        !form.graduacao
      ) {
        toast.error("Informe a graduação se já treinou no Capoeira Brasil");
        return false;
      }
    }

    // Step 2 (se menor de idade) - Responsável
    if (step === 2 && idade < 18) {
      if (
        !form.nome_responsavel ||
        !form.responsavel_documento ||
        !form.responsavel_parentesco ||
        !form.telefone_responsavel
      ) {
        toast.error("Preencha todos os campos do responsável (passo 2)");
        return false;
      }
    }

    // Step contato (adulto = passo 2, menor = passo 3)
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

    // Step autorizações
    if ((step === 3 && idade >= 18) || (step === 4 && idade < 18)) {
      if (!form.aceite_lgpd) {
        toast.error("Você precisa aceitar a política de privacidade (LGPD)");
        return false;
      }
    }

    return true;
  }

  function nextStep() {
    if (validarStep()) {
      setStep((s) => s + 1);
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validarStep()) return;

    const idade = calcularIdade(form.nascimento);

    const payload = {
      ...form,
      cpf: limparNumeros(form.cpf),
      telefone_aluno: limparNumeros(form.telefone_aluno || ""),
      telefone_responsavel:
        idade < 18 ? limparNumeros(form.telefone_responsavel || "") : null,
      responsavel_documento:
        idade < 18 ? limparNumeros(form.responsavel_documento || "") : null,
      nome_responsavel: idade < 18 ? form.nome_responsavel : null,
      responsavel_parentesco: idade < 18 ? form.responsavel_parentesco : null,
      email: form.email.toLowerCase(),
    };

    logger.log("[useMatriculaSteps] Enviando payload", payload);
    await registrarMatricula(payload);
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
    setStep,
  };
}

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

export function usePreMatriculaSteps(registrarPreMatricula, slug) {
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
    grupo_origem: "",
    grupo_personalizado: "",
    imagemBase64: "",
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
      slug,
      nome: form.nome,
      apelido: form.apelido || null,
      nascimento: form.nascimento,
      cpf: limparNumeros(form.cpf),
      email: form.email.toLowerCase(),
      telefone_aluno: limparNumeros(form.telefone_aluno) || null,
      telefone_responsavel: limparNumeros(form.telefone_responsavel) || null,
      nome_responsavel: form.nome_responsavel || null,
      responsavel_documento: limparNumeros(form.responsavel_documento) || null,
      responsavel_parentesco: form.responsavel_parentesco || null,
      endereco: form.endereco || null,
      ja_treinou: form.ja_treinou,
      grupo_origem:
        form.grupo_origem === "Outros"
          ? form.grupo_personalizado
          : form.grupo_origem,
      categoria_id: form.categoria_id || null,
      graduacao_id: form.graduacao_id || null,
      observacoes_medicas: possuiRestricao ? form.observacoes_medicas : null,
      autorizacao_imagem: form.autorizacao_imagem ? 1 : 0,
      aceite_lgpd: form.aceite_lgpd ? 1 : 0,
      imagemBase64: form.imagemBase64 || null,
    };
    
    logger.info("[usePreMatriculaSteps] Enviando payload", payload);
    await registrarPreMatricula(payload, slug);
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

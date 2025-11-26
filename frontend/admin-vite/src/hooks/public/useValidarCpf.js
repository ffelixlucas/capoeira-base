import { useState, useEffect, useRef } from "react";
import { validarCpf } from "../../services/public/preMatriculaPublicService";

// 🟦 Máscara de CPF (000.000.000-00)
function aplicarMascaraCPF(valor) {
  return valor
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .substring(0, 14);
}

export function useValidarCpf(slug) {
  const [cpf, setCpfInterno] = useState("");
  const [status, setStatus] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const timeoutRef = useRef(null);

  // 🟩 setter COM máscara integrada
  function setCpf(valor) {
    const mascarado = aplicarMascaraCPF(valor);
    setCpfInterno(mascarado);
  }

  // 🟦 Validação automática com debounce
  useEffect(() => {
    const cpfLimpo = cpf.replace(/\D/g, "");

    if (!cpf || cpfLimpo.length !== 11) {
      setStatus(null);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        setCarregando(true);
        const resp = await validarCpf(cpfLimpo, slug);
        setStatus(resp); // { existe, tipo, mensagem }
      } catch (err) {
        console.error("Erro ao validar CPF:", err);
      } finally {
        setCarregando(false);
      }
    }, 500);

    return () => clearTimeout(timeoutRef.current);
  }, [cpf, slug]);

  return {
    cpf,
    setCpf,
    status,
    carregando,
  };
}

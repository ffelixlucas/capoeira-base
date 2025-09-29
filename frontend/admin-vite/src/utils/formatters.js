// src/utils/formatters.js

/**
 * Formata CPF no padrão 000.000.000-00
 */
export function formatarCPF(valor = "") {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .substring(0, 14);
  }
  
  /**
   * Formata telefone no padrão (XX) XXXXX-XXXX
   */
  export function formatarTelefone(valor = "") {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2")
      .substring(0, 15);
  }
  
  /**
   * Remove todos os caracteres que não são números
   */
  export function limparNumeros(valor = "") {
    return valor.replace(/\D/g, "");
  }
  
  /**
   * Valida formato de e-mail
   */
  export function validarEmail(valor = "") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  }
  
  /**
   * Converte string para maiúsculas de forma segura
   */
  export function toUpperSafe(valor = "") {
    return valor ? valor.toString().toUpperCase() : "";
  }
  
  /**
   * Converte string para minúsculas de forma segura
   */
  export function toLowerSafe(valor = "") {
    return valor ? valor.toString().toLowerCase() : "";
  }

  export function calcularIdade(dataNasc) {
    if (!dataNasc) return 0;
    const hoje = new Date();
    const [ano, mes, dia] = dataNasc.split("-").map(Number); // força YYYY-MM-DD
    const nasc = new Date(ano, mes - 1, dia);
  
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  }
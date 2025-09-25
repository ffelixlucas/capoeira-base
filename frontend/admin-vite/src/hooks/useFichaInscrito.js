// src/hooks/useFichaInscrito.js
export function useFichaInscrito() {
    function formatarData(data) {
      if (!data) return "-";
      const d = new Date(data);
      return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("pt-BR");
    }
  
    function formatBool(val) {
      if (val === 1 || val === "1" || val === true || val === "true") return "Sim";
      if (val === 0 || val === "0" || val === false || val === "false") return "Não";
      return "-";
    }
  
    function abrirWhatsApp(numero) {
      if (!numero) return;
      const numeroLimpo = numero.replace(/\D/g, "");
      window.open(`https://wa.me/55${numeroLimpo}`, "_blank");
    }
  
    return { formatarData, formatBool, abrirWhatsApp };
  }
  
import { useEffect } from "react";
import { buscarStatusInscricao } from "../../services/public/inscricaoPublicService";

export const useMonitorarPagamento = (inscricaoId, onSucesso, onErro) => {
  useEffect(() => {
    if (!inscricaoId) return;

    const interval = setInterval(async () => {
      try {
        const data = await buscarStatusInscricao(inscricaoId);

        if (data.status === "pago") {
          clearInterval(interval);
          onSucesso(data);
        }

        if (["rejeitado", "expired", "falhou"].includes(data.status)) {
          clearInterval(interval);
          if (onErro) onErro(data);
        }
      } catch (err) {
        console.error("Erro ao verificar status da inscrição:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [inscricaoId, onSucesso, onErro]);
};

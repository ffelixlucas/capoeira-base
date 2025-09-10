// /src/hooks/public/useParcelas.js
import { useState } from "react";
import { buscarParcelas } from "../../services/public/pagamentoPublicService";
import { logger } from "../../utils/logger";

export const useParcelas = () => {
  const [parcelas, setParcelas] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarParcelas = async (eventoId, bin) => {
    try {
      setLoading(true);
      logger.log("[useParcelas] carregando parcelas...", { eventoId, bin });

      const data = await buscarParcelas(eventoId, bin);
      setParcelas(data);

      logger.log("[useParcelas] parcelas carregadas:", data);
    } catch (err) {
      logger.error("[useParcelas] erro ao carregar parcelas:", err);
    } finally {
      setLoading(false);
    }
  };

  return { parcelas, loading, carregarParcelas };
};

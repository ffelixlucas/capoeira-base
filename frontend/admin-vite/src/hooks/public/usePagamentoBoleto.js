import { useState } from "react";
import { pagarBoleto } from "../../services/public/pagamentoPublicService";
import logger from "../../utils/logger";

/**
 * Hook para gerenciar o pagamento via boleto
 */
export function usePagamentoBoleto() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [boleto, setBoleto] = useState(null);

  /**
   * Envia dados para gerar boleto no backend
   * @param {Object} dados - Payload com dados pessoais, evento e endereço
   */
  const gerarBoleto = async (dados) => {
    logger.log("[usePagamentoBoleto] Iniciando geração do boleto...", dados);
    setLoading(true);
    setErro(null);

    try {
      const resposta = await pagarBoleto(dados);

      logger.log("[usePagamentoBoleto] Boleto gerado com sucesso:", resposta);
      setBoleto(resposta);
      return resposta;
    } catch (err) {
      logger.error("[usePagamentoBoleto] Erro ao gerar boleto:", err.message);
      setErro(err.message);
      throw err;
    } finally {
      setLoading(false);
      logger.log("[usePagamentoBoleto] Finalizado.");
    }
  };

  return { gerarBoleto, boleto, loading, erro };
}

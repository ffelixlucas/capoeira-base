import { useState, useEffect } from "react";
import { pagarCartao } from "../../services/public/pagamentoPublicService";
import { logger } from "../../utils/logger";
import { toast } from "react-toastify";
import { useMonitorarPagamento } from "./useMonitorarPagamento"; 

  export const usePagamentoCartao = () => {
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);
    const [resposta, setResposta] = useState(null);
  
    // ✅ Hook pode ser usado aqui, fora de condicionais
    useMonitorarPagamento(
      resposta?.id && resposta?.status === "pendente" ? resposta.id : null,
      (inscricao) => {
        logger.log("✅ [usePagamentoCartao] inscrição confirmada:", inscricao);
        setResposta(inscricao); // atualiza com dados completos
      },
      (erro) => {
        logger.error("❌ Erro monitorando pagamento:", erro);
      }
    );
  
    const pagar = async (dados) => {
      try {
        setLoading(true);
        setErro(null);
        setResposta(null);
  
        logger.log("[usePagamentoCartao] iniciando pagamento", dados);
  
        const respostaApi = await pagarCartao(dados);
  
        logger.log("[usePagamentoCartao] resposta do backend:", respostaApi);
  
        setResposta(respostaApi); 
        return respostaApi;
      } catch (err) {
        logger.error("[usePagamentoCartao] erro no pagamento:", err);
        const msg = err?.message?.includes("Pagamento rejeitado")
          ? "❌ Pagamento rejeitado: verifique os dados do cartão."
          : "⚠️ Erro ao processar o pagamento. Tente novamente.";
        setErro(new Error(msg));
        toast.error(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    };
  
    return { pagar, loading, erro, resposta };
  };
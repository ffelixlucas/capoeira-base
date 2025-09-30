// /src/services/public/pagamentoPublicService.js
import api from "../api";
import logger from "../../utils/logger";

/**
 * Busca as opções de parcelas no backend
 * @param {number} eventoId - ID do evento
 * @param {string} bin - 6 primeiros dígitos do cartão
 */
export const buscarParcelas = async (eventoId, bin) => {
  try {
    logger.log("[pagamentoPublicService] buscando parcelas...", {
      eventoId,
      bin,
    });

    const { data } = await api.get("/public/inscricoes/parcelas", {
      params: { evento_id: eventoId, bin },
    });

    logger.log("[pagamentoPublicService] parcelas recebidas:", data);
    return data;
  } catch (err) {
    logger.error("[pagamentoPublicService] erro ao buscar parcelas:", err);
    throw err;
  }
};

/**
 * Envia pagamento com cartão para o backend
 * @param {Object} dados - Payload com token, parcelas, dados do cliente e evento
 */
export const pagarCartao = async (dados) => {
  try {
    logger.log("[pagamentoPublicService] enviando pagamento cartao...", dados);

    const { data } = await api.post(
      "/public/inscricoes/pagamento-cartao",
      dados
    );

    logger.log("[pagamentoPublicService] resposta pagamento cartao:", data);
    return data;
  } catch (error) {
    logger.error(
      "[pagamentoPublicService] erro ao enviar pagamento cartao:",
      error
    );

    const msg = error.response?.data?.error || "Erro ao processar pagamento.";
    logger.error("[pagamentoPublicService] msg recebida do backend:", msg);
    
    // Tratamentos amigáveis para o usuário
    if (msg.includes("já possui inscrição confirmada")) {
      throw new Error(
        "Este CPF já possui uma inscrição paga para este evento."
      );
    }

    if (msg.includes("não encontrada")) {
      throw new Error(
        "Não foi possível localizar sua inscrição. Verifique os dados ou tente novamente."
      );
    }

    // Fallback genérico
    throw new Error("Erro ao processar pagamento com cartão. Tente novamente.");
  }
};

/**
 * Envia pagamento com boleto para o backend
 * @param {Object} dados - Payload com dados pessoais, evento e endereço
 */
export const pagarBoleto = async (dados) => {
  try {
    logger.log("[pagamentoPublicService] enviando pagamento boleto...", dados);

    const { data } = await api.post(
      "/public/inscricoes/pagamento-boleto",
      dados
    );

    logger.log("[pagamentoPublicService] resposta pagamento boleto:", data);
    return data;
  } catch (error) {
    logger.error(
      "[pagamentoPublicService] erro ao enviar pagamento boleto:",
      error
    );

    const msg = error.response?.data?.error || "Erro ao gerar boleto.";
    logger.error("[pagamentoPublicService] msg recebida do backend:", msg);

    // Tratamentos amigáveis
    if (msg.includes("já possui inscrição confirmada")) {
      throw new Error(
        "Este CPF já possui uma inscrição paga para este evento."
      );
    }

    if (msg.includes("inválido") || msg.includes("obrigatório")) {
      throw new Error(msg); // mostra a validação exata
    }

    // Fallback genérico
    throw new Error("Erro ao gerar boleto. Tente novamente.");
  }
};

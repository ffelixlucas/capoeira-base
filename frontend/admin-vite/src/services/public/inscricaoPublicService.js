import api from "../api";
import logger from "../../utils/logger";

export async function gerarPagamentoPix(dados) {
  try {
    const response = await api.post("/public/inscricoes/pagamento", dados);
    return response.data;
  } catch (error) {
    if (error.response?.data?.error === "Inscrição já realizada e paga.") {
      throw new Error("Este CPF já possui uma inscrição paga para este evento.");
    }
    throw new Error("Erro ao gerar pagamento. Tente novamente mais tarde.");
  }
}

export const buscarStatusInscricao = async (inscricaoId) => {
  const { data } = await api.get(`/public/inscricoes/${inscricaoId}`);
  return data;
};

/**
 * Busca os valores de inscrição (pix, cartao, boleto) já calculados no backend
 * @param {number} eventoId
 */
export async function buscarValoresEvento(eventoId) {
  try {
    logger.log("[inscricaoPublicService] buscando valores do evento", { eventoId });
    const { data } = await api.get(`/public/inscricoes/valores/${eventoId}`);
    logger.log("[inscricaoPublicService] valores recebidos:", data);
    return data; 
  } catch (error) {
    logger.error("[inscricaoPublicService] erro ao buscar valores:", error);
    throw new Error("Erro ao carregar valores de inscrição.");
  }
}
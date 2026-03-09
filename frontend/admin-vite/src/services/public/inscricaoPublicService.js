import api from "../api";
import logger from "../../utils/logger";

export async function gerarPagamentoPix(dados) {
  try {
    const response = await api.post("/public/inscricoes/pagamento", dados);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.error || "";

    if (msg === "Inscrição já realizada e paga.") {
      throw new Error("Este CPF já possui uma inscrição paga para este evento.");
    }

    if (
      msg.includes("idade mínima") ||
      msg.includes("a partir de") ||
      msg.includes("encerradas") ||
      msg.includes("Limite de inscritos") ||
      msg.includes("inválid")
    ) {
      throw new Error(msg);
    }

    throw new Error("Erro ao gerar pagamento. Tente novamente mais tarde.");
  }
}

export async function buscarCategoriasPublicas(slug) {
  const { data } = await api.get(`/public/pre-matriculas/${slug}/categorias`);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function buscarGraduacoesPublicas(slug, categoriaId) {
  const { data } = await api.get(
    `/public/pre-matriculas/${slug}/graduacoes/${categoriaId}`
  );
  return Array.isArray(data?.data) ? data.data : [];
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

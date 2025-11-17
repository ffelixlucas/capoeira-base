import api from "./api";
import { logger } from "../utils/logger";

export async function buscarGraduacoesPorCategoria(categoriaId) {
  try {
    const { data } = await api.get(`/graduacoes/categoria/${categoriaId}`);
    return data.data || [];
  } catch (err) {
    logger.error("[graduacoesService] buscarGraduacoesPorCategoria", err);
    return [];
  }
}

export async function criarGraduacao({ categoriaId, nome, ordem }) {
  try {
    const { data } = await api.post("/graduacoes", {
      categoriaId,
      nome,
      ordem,
    });
    return data;
  } catch (err) {
    logger.error("[graduacoesService] criarGraduacao", err);
    throw err;
  }
}

export async function atualizarGraduacao(id, payload) {
  try {
    const { data } = await api.put(`/graduacoes/${id}`, payload);
    return data;
  } catch (err) {
    logger.error("[graduacoesService] atualizarGraduacao", err);
    throw err;
  }
}

export async function removerGraduacao(id) {
  try {
    const { data } = await api.delete(`/graduacoes/${id}`);
    return data;
  } catch (err) {
    logger.error("[graduacoesService] removerGraduacao", err);
    throw err;
  }
}

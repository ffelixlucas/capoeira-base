// src/services/notificacoesService.js
import api from "./api";
import { logger } from "../utils/logger";

const PREFIX = "/alunos";

/**
 * Busca a contagem de matrículas pendentes
 */
export const getPendentesCount = async () => {
  try {
    const { data } = await api.get(`${PREFIX}/pendentes/count`);
    return data.count;
  } catch (error) {
    logger.error("Erro ao buscar contagem de pendentes:", error);
    throw error;
  }
};

/**
 * Lista alunos pendentes de aprovação
 */
export const listarPendentes = async () => {
  try {
    const { data } = await api.get(`${PREFIX}?status=pendente`);
    return data;
  } catch (error) {
    logger.error("Erro ao listar pendentes:", error);
    throw error;
  }
};

/**
 * Atualiza status da matrícula (aprovar/rejeitar)
 */
export const atualizarStatus = async (id, status) => {
  try {
    const { data } = await api.patch(`${PREFIX}/${id}/status`, { status });
    return data;
  } catch (error) {
    logger.error(`Erro ao atualizar status do aluno ${id}:`, error);
    throw error;
  }
};

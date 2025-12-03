// src/services/notificacaoService.js
import api from "./api";
import { logger } from "../utils/logger";

/**
 * Lista todos os e-mails de notificação por tipo (multi-org)
 */
export async function listarNotificacoes(tipo) {
  try {
    // nova rota: /api/notificacoes/:tipo
    const url = `/notificacoes/${tipo}`;
    const res = await api.get(url);

    const data = res.data?.data ?? res.data; // compatibilidade

    logger.debug(
      `[notificacaoService] GET ${url} → ${data.length} registros`
    );

    return data;
  } catch (err) {
    logger.error("[notificacaoService] Erro ao listar:", err);
    throw err;
  }
}

/**
 * Adiciona novo e-mail de notificação (multi-org)
 */
export async function adicionarNotificacao(payload) {
  try {
    // nova rota: /api/notificacoes
    const url = `/notificacoes`;

    const res = await api.post(url, payload);

    logger.info(
      `[notificacaoService] POST ${url} → criado ${payload.email} (${payload.tipo})`
    );

    return res.data?.data ?? res.data;
  } catch (err) {
    logger.error("[notificacaoService] Erro ao adicionar:", err);
    throw err;
  }
}

/**
 * Remove e-mail de notificação
 */
export async function removerNotificacao(id) {
  try {
    const url = `/notificacoes/${id}`;
    await api.delete(url);

    logger.warn(`[notificacaoService] DELETE ${url} → id ${id}`);

    return true;
  } catch (err) {
    logger.error("[notificacaoService] Erro ao remover:", err);
    throw err;
  }
}

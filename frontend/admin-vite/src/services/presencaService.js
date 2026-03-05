// src/services/presencaService.js
import api from "./api"; // mesmo client que você usa nos outros services
import { logger } from "../utils/logger";

export async function listarPorTurmaEData(turmaId, data) {
  const { data: resp } = await api.get(`/presencas`, {
    params: { turma_id: turmaId, data },
  });
  return resp; // { turma_id, data, presencas: [...] }
}

export async function salvarBatch({ turma_id, data, itens }) {
  const { data: resp } = await api.post(`/presencas/batch`, {
    turma_id,
    data,
    itens, // [{ aluno_id, status }]
  });
  return resp; // { ok: true, mensagem: 'Presenças salvas' }
}

export async function listarResumoDia(data) {
  const { data: resp } = await api.get(`/presencas/resumo-dia`, {
    params: { data },
  });
  return resp;
}

export async function listarAtividadesRecentes(limit = 20, turmaId = null) {
  const params = turmaId ? { limit, turma_id: turmaId } : { limit };
  logger.debug("[presencaService] listarAtividadesRecentes:request", params);
  const { data: resp } = await api.get(`/presencas/atividades-recentes`, { params });
  logger.debug("[presencaService] listarAtividadesRecentes:response", {
    tipo: resp?.tipo,
    atividades: Array.isArray(resp?.atividades) ? resp.atividades.length : undefined,
    historico: Array.isArray(resp?.historico) ? resp.historico.length : undefined,
    atividadeData: resp?.atividade?.data,
    atividadeTurmaId: resp?.atividade?.turma_id,
  });
  return resp;
}

export async function atualizarPresenca(id, dados) {
  const { data: resp } = await api.put(`/presencas/${id}`, dados);
  return resp;
}

export async function relatorioPresencas(inicio, fim) {
  const { data: resp } = await api.get(`/presencas/relatorio`, {
    params: { inicio, fim },
  });
  return resp;
}

// src/services/presencaService.js
import api from "./api"; // mesmo client que você usa nos outros services

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

export async function listarAtividadesRecentes(limit = 20) {
  const { data: resp } = await api.get(`/presencas/atividades-recentes`, {
    params: { limit },
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

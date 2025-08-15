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

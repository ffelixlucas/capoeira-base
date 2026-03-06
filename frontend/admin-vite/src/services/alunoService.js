// src/services/alunoService.js
import api from "./api"; // axios com token JWT

export async function listarAlunos(turmaId) {
  const url = turmaId ? `/alunos?turma_id=${turmaId}` : "/alunos";


  const res = await api.get(url);

  const ids = Array.isArray(res.data) ? res.data.map(a => a.id) : [];

  return res.data;
}


export async function buscarAluno(id) {
  const res = await api.get(`/alunos/${id}`);
  return res.data;
}

export async function criarAluno(dados) {
  const res = await api.post("/alunos", dados);
  return res.data;
}

export async function editarAluno(id, dados) {
  const res = await api.put(`/alunos/${id}`, dados);
  return res.data;
}

export async function excluirAluno(id) {
  const res = await api.delete(`/alunos/${id}`);
  return res.data;
}

export async function trocarTurma(id, novaTurmaId) {
  const res = await api.put(`/alunos/${id}/trocar-turma`, {
    nova_turma_id: novaTurmaId,
  });
  return res.data;
}

export async function solicitarTransferenciaTurma(
  alunoId,
  turmaOrigemId,
  turmaDestinoId,
  observacao = null
) {
  const res = await api.post(`/alunos/${alunoId}/solicitar-transferencia`, {
    turma_origem_id: turmaOrigemId,
    turma_destino_id: turmaDestinoId,
    observacao,
  });
  return res.data;
}

export async function listarTransferenciasPendentes(turmaId) {
  const params = turmaId ? { turma_id: turmaId } : undefined;
  const res = await api.get("/alunos/transferencias/pendentes", { params });
  return Array.isArray(res.data) ? res.data : [];
}

export async function listarTransferenciasRecentes(limit = 10) {
  const res = await api.get("/alunos/transferencias/recentes", {
    params: { limit },
  });
  return Array.isArray(res.data) ? res.data : [];
}

export async function confirmarTransferencia(transferenciaId) {
  const res = await api.post(`/alunos/transferencias/${transferenciaId}/confirmar`);
  return res.data;
}

export async function desfazerTransferencia(transferenciaId) {
  const res = await api.post(`/alunos/transferencias/${transferenciaId}/desfazer`);
  return res.data;
}

export async function listarAuditoriaAtividades(limit = 120) {
  const res = await api.get("/alunos/auditoria/atividades", {
    params: { limit },
  });
  return Array.isArray(res.data) ? res.data : [];
}

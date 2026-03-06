// src/services/alunoService.js
import api from "./api"; // axios com token JWT

let transferenciasPendentesCache = null;
let transferenciasPendentesCacheAt = 0;
let transferenciasPendentesInFlight = null;
const TRANSFERENCIAS_PENDENTES_TTL_MS = 1500;

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
  if (!turmaId) {
    const agora = Date.now();
    if (
      transferenciasPendentesCache &&
      agora - transferenciasPendentesCacheAt < TRANSFERENCIAS_PENDENTES_TTL_MS
    ) {
      return transferenciasPendentesCache;
    }
    if (transferenciasPendentesInFlight) {
      return transferenciasPendentesInFlight;
    }
  }

  const params = turmaId ? { turma_id: turmaId } : undefined;
  const request = api
    .get("/alunos/transferencias/pendentes", { params })
    .then((res) => (Array.isArray(res.data) ? res.data : []));

  if (!turmaId) {
    transferenciasPendentesInFlight = request;
  }

  try {
    const data = await request;
    if (!turmaId) {
      transferenciasPendentesCache = data;
      transferenciasPendentesCacheAt = Date.now();
    }
    return data;
  } finally {
    if (!turmaId) {
      transferenciasPendentesInFlight = null;
    }
  }
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

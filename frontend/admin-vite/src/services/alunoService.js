// src/services/alunoService.js
import api from "./api"; // axios com token JWT

export async function listarAlunos() {
  const res = await api.get("/alunos");
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

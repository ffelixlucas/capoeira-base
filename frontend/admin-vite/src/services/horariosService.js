// src/services/horariosService.js

import api from './api'; // Usa nossa instância axios que já tem baseURL configurada

// 🔍 Listar todos os horários
export async function listarHorarios() {
  const response = await api.get('/horarios');
  return response.data;
}

// 🔍 Obter um horário específico por ID
export async function obterHorario(id) {
  const response = await api.get(`/horarios/${id}`);
  return response.data;
}

// ➕ Criar um novo horário
export async function criarHorario(dados) {
  const response = await api.post('/horarios', dados);
  return response.data;
}

// ✏️ Atualizar um horário existente
export async function atualizarHorario(id, dados) {
  await api.put(`/horarios/${id}`, dados);
}

// 🗑️ Excluir um horário
export async function excluirHorario(id) {
  await api.delete(`/horarios/${id}`);
}

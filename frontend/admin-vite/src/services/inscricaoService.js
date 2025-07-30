// src/services/inscricaoService.js
import api from "./api";

export async function buscarInscritosPorEvento(eventoId, busca = "") {
  const token = localStorage.getItem("token");

  const response = await api.get(`/inscricoes/${eventoId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { busca }, // envia a busca como query param
  });

  return response.data.data;
}

export async function buscarInscritoPorId(id) {
  const token = localStorage.getItem("token");

  const response = await api.get(`/inscricoes/detalhes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data.data;
}
export async function atualizarInscrito(id, dados) {
  const token = localStorage.getItem("token");

  const response = await api.put(`/inscricoes/${id}`, dados, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // O backend retorna { sucesso: true, data: {...} }
  return response.data.data;
}

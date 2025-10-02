// src/services/inscricaoService.js
import api from "./api";
import { logger } from "../utils/logger";

export async function buscarInscritosPorEvento(eventoId, busca = "", categoriaId = "todos") {
  const token = localStorage.getItem("token");
  logger.log("[inscricaoService] buscando inscritos", { eventoId, busca, categoriaId });


  const response = await api.get(`/inscricoes/${eventoId}`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { busca, categoria: categoriaId }, 
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

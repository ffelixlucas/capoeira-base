// src/services/turmaService.js
import api from "./api";

export async function listarTurmas() {
  const res = await api.get("/turmas");
  return res.data;
}

export async function getMinhasTurmas() {
  const res = await api.get("/turmas/minhas");
  return res.data;
}
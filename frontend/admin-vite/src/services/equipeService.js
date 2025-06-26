// src/services/equipeService.js
import api from "./api"; // já deve existir o axios configurado com baseURL e token

export async function listarEquipe() {
  const res = await api.get("/equipe");
  return res.data;
}

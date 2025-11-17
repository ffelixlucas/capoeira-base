import api from "./api";
import { logger } from "../utils/logger";

export async function buscarCategorias() {
  try {
    const { data } = await api.get("/categorias");
    return data.data || [];
  } catch (err) {
    logger.error("[categoriasService] buscarCategorias", err);
    return [];
  }
}

export async function criarCategoria(nome) {
  try {
    const { data } = await api.post("/categorias", { nome });
    return data;
  } catch (err) {
    logger.error("[categoriasService] criarCategoria", err);
    throw err;
  }
}

export async function atualizarCategoria(id, nome) {
  try {
    const { data } = await api.put(`/categorias/${id}`, { nome });
    return data;
  } catch (err) {
    logger.error("[categoriasService] atualizarCategoria", err);
    throw err;
  }
}

export async function removerCategoria(id) {
  try {
    const { data } = await api.delete(`/categorias/${id}`);
    return data;
  } catch (err) {
    logger.error("[categoriasService] removerCategoria", err);
    throw err;
  }
}

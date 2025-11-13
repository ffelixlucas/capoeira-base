// 📁 src/services/turmasService.js
import api from "./api";
import { logger } from "../utils/logger";

/* -------------------------------------------------------------------------- */
/* 🔍 Listar todas as turmas da organização                                   */
/* -------------------------------------------------------------------------- */
export async function listarTurmas() {
  try {
    logger.debug("[turmasService] Listando turmas...");
    const { data } = await api.get("/turmas");
    logger.debug("[turmasService] Turmas carregadas", { total: data.length });
    return Array.isArray(data) ? data : [];
  } catch (erro) {
    logger.error("[turmasService] Erro ao listar turmas", { erro: erro.message });
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* 👨‍🏫 Listar turmas do instrutor logado                                    */
/* -------------------------------------------------------------------------- */
export async function listarMinhasTurmas() {
  try {
    logger.debug("[turmasService] Listando turmas do instrutor...");
    const { data } = await api.get("/turmas/minhas");
    return Array.isArray(data) ? data : [];
  } catch (erro) {
    logger.error("[turmasService] Erro ao listar turmas do instrutor", { erro: erro.message });
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* ➕ Criar nova turma                                                       */
/* -------------------------------------------------------------------------- */
export async function criarTurma(dados) {
  try {
    logger.debug("[turmasService] Criando turma", { nome: dados?.nome });
    const { data } = await api.post("/turmas", dados);
    logger.debug("[turmasService] Turma criada com sucesso", { id: data.id });
    return data;
  } catch (erro) {
    logger.error("[turmasService] Erro ao criar turma", { erro: erro.message });
    throw erro.response?.data || erro;
  }
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar turma existente                                              */
/* -------------------------------------------------------------------------- */
export async function atualizarTurma(id, dados) {
  try {
    logger.debug("[turmasService] Atualizando turma", { id });
    const { data } = await api.put(`/turmas/${id}`, dados);
    logger.debug("[turmasService] Turma atualizada com sucesso", { id });
    return data;
  } catch (erro) {
    logger.error("[turmasService] Erro ao atualizar turma", { id, erro: erro.message });
    throw erro.response?.data || erro;
  }
}

/* -------------------------------------------------------------------------- */
/* ❌ Excluir turma                                                          */
/* -------------------------------------------------------------------------- */
export async function excluirTurma(id) {
  try {
    logger.debug("[turmasService] Excluindo turma", { id });
    const { data } = await api.delete(`/turmas/${id}`);
    logger.debug("[turmasService] Turma excluída com sucesso", { id });
    return data;
  } catch (erro) {
    logger.error("[turmasService] Erro ao excluir turma", { id, erro: erro.message });
    throw erro.response?.data || erro;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔁 Encerrar turma (migrar alunos)                                         */
/* -------------------------------------------------------------------------- */
export async function encerrarTurma(id, destino_id) {
  try {
    logger.debug("[turmasService] Encerrando turma", { id, destino_id });
    const { data } = await api.post(`/turmas/${id}/encerrar`, { destino_id });
    logger.debug("[turmasService] Turma encerrada com sucesso", { id, destino_id });
    return data;
  } catch (erro) {
    logger.error("[turmasService] Erro ao encerrar turma", {
      id,
      destino_id,
      erro: erro.message,
    });
    throw erro.response?.data || erro;
  }
}

export { listarMinhasTurmas as getMinhasTurmas };

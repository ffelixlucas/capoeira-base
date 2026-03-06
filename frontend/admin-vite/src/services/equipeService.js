// 📁 src/services/equipeService.js
import api from "./api";
import { logger } from "../utils/logger";

let perfilCache = null;
let perfilCacheAt = 0;
let perfilInFlight = null;
const PERFIL_CACHE_TTL_MS = 5000;

/* -------------------------------------------------------------------------- */
/* 🔍 Listar todos os membros da equipe (multi-org automático via token)      */
/* -------------------------------------------------------------------------- */
export async function listarEquipe() {
  try {
    logger.debug("[equipeService] Listando membros da equipe...");
    const { data } = await api.get("/equipe");
    const membros = Array.isArray(data) ? data : [];
    logger.debug("[equipeService] Equipe carregada", { total: membros.length });
    return membros;
  } catch (erro) {
    logger.error("[equipeService] Erro ao listar equipe", { erro: erro.message });
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* ➕ Criar novo membro                                                       */
/* -------------------------------------------------------------------------- */
export async function criarMembro(dados) {
  try {
    logger.debug("[equipeService] Criando novo membro", { nome: dados?.nome });
    const { data } = await api.post("/equipe", dados);
    return data;
  } catch (erro) {
    logger.error("[equipeService] Erro ao criar membro", { erro: erro.message });
    throw erro.response?.data || erro;
  }
}

/* -------------------------------------------------------------------------- */
/* 🛠️ Atualizar dados de um membro                                            */
/* -------------------------------------------------------------------------- */
export async function atualizarMembro(id, dados) {
  try {
    logger.debug("[equipeService] Atualizando membro", { id });
    const { data } = await api.put(`/equipe/${id}`, dados);
    return data;
  } catch (erro) {
    logger.error("[equipeService] Erro ao atualizar membro", { id, erro: erro.message });
    throw erro.response?.data || erro;
  }
}

/* -------------------------------------------------------------------------- */
/* ❌ Remover membro da equipe                                                */
/* -------------------------------------------------------------------------- */
export async function removerMembro(id) {
  try {
    logger.debug("[equipeService] Removendo membro", { id });
    const { data } = await api.delete(`/equipe/${id}`);
    return data;
  } catch (erro) {
    logger.error("[equipeService] Erro ao remover membro", { id, erro: erro.message });
    throw erro.response?.data || erro;
  }
}

/* -------------------------------------------------------------------------- */
/* 👤 Buscar e atualizar perfil do usuário logado                             */
/* -------------------------------------------------------------------------- */
export async function buscarPerfil() {
  const agora = Date.now();
  if (perfilCache && agora - perfilCacheAt < PERFIL_CACHE_TTL_MS) {
    return perfilCache;
  }

  if (perfilInFlight) {
    return perfilInFlight;
  }

  try {
    logger.debug("[equipeService] Buscando perfil do usuário logado...");
    perfilInFlight = api.get("/equipe/me");
    const { data } = await perfilInFlight;
    perfilCache = data;
    perfilCacheAt = Date.now();
    return data;
  } catch (erro) {
    logger.error("[equipeService] Erro ao buscar perfil", { erro: erro.message });
    throw erro.response?.data || erro;
  } finally {
    perfilInFlight = null;
  }
}

export async function atualizarPerfil(dados) {
  try {
    logger.debug("[equipeService] Atualizando perfil do usuário logado");
    const { data } = await api.put("/equipe/me", dados);
    return data;
  } catch (erro) {
    logger.error("[equipeService] Erro ao atualizar perfil", { erro: erro.message });
    throw erro.response?.data || erro;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔑 Atualizar senha do usuário logado                                       */
/* -------------------------------------------------------------------------- */
export async function atualizarSenha(dados) {
  try {
    logger.debug("[equipeService] Alterando senha do usuário logado");
    const { data } = await api.put("/equipe/me/senha", dados);
    return data;
  } catch (erro) {
    logger.error("[equipeService] Erro ao alterar senha", { erro: erro.message });
    throw erro.response?.data || erro;
  }
}

/* -------------------------------------------------------------------------- */
/* 🎭 Papéis (Roles) - gerenciamento secundário                              */
/* -------------------------------------------------------------------------- */
export async function listarRoles() {
  try {
    const { data } = await api.get("/roles");
    return Array.isArray(data) ? data : [];
  } catch (erro) {
    logger.error("[equipeService] Erro ao listar roles", { erro: erro.message });
    return [];
  }
}

export async function atribuirPapel(equipeId, roleId) {
  try {
    logger.debug("[equipeService] Atribuindo papel", { equipeId, roleId });
    const { data } = await api.post(`/equipe/${equipeId}/roles`, { roleId });
    return data;
  } catch (erro) {
    logger.error("[equipeService] Erro ao atribuir papel", { equipeId, roleId, erro: erro.message });
    throw erro.response?.data || erro;
  }
}

export async function removerTodosOsPapeis(equipeId) {
  try {
    logger.debug("[equipeService] Removendo todos os papéis", { equipeId });
    const { data } = await api.delete(`/equipe/${equipeId}/roles`);
    return data;
  } catch (erro) {
    logger.error("[equipeService] Erro ao remover papéis", { equipeId, erro: erro.message });
    throw erro.response?.data || erro;
  }
}

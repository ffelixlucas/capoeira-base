// 📁 services/equipeService.js
import api from "./api";

/**
 * 🔍 Buscar todos os membros da equipe
 */
export async function listarEquipe() {
  try {
    const response = await api.get("/equipe");
    return Array.isArray(response.data) ? response.data : [];
  } catch (erro) {
    console.error("Erro ao listar equipe:", erro);
    return []; // Fallback seguro
  }
}

/**
 * ➕ Criar novo membro da equipe
 * @param {Object} dados - nome, telefone, email, etc.
 */
export async function criarMembro(dados) {
  try {
    const response = await api.post("/equipe", dados);
    return response.data;
  } catch (erro) {
    console.error("Erro ao criar membro:", erro);
    throw erro;
  }
}

/**
 * 📜 Listar todos os papéis disponíveis
 */
export async function listarRoles() {
  try {
    const response = await api.get("/roles");
    return Array.isArray(response.data) ? response.data : [];
  } catch (erro) {
    console.error("Erro ao listar roles:", erro);
    return [];
  }
}

/**
 * 🎭 Atribuir papel a um membro
 */
export async function atribuirPapel(equipeId, roleId) {
  try {
    const response = await api.post(`/equipe/${equipeId}/roles`, { roleId });
    return response.data;
  } catch (erro) {
    console.error("Erro ao atribuir papel:", erro);
    throw erro;
  }
}

/**
 * 🛠️ Atualizar dados de um membro
 */
export async function atualizarMembro(id, dados) {
  try {
    const response = await api.put(`/equipe/${id}`, dados);
    return response.data;
  } catch (erro) {
    console.error("Erro ao atualizar membro:", erro);
    throw erro;
  }
}

/**
 * ❌ Remover membro da equipe
 */
export async function removerMembro(id) {
  try {
    const response = await api.delete(`/equipe/${id}`);
    return response.data;
  } catch (erro) {
    console.error("Erro ao remover membro:", erro);
    throw erro;
  }
}

/**
 * 🧹 Remover todos os papéis atribuídos a um membro
 */
export async function removerTodosOsPapeis(equipeId) {
  try {
    const response = await api.delete(`/equipe/${equipeId}/roles`);
    return response.data;
  } catch (erro) {
    console.error("Erro ao remover papéis:", erro);
    throw erro;
  }
}

import api from "./api";

export async function listarEquipe() {
  const response = await api.get("/equipe");
  return response.data; // 👈 agora sim, retorna só o array
}

export async function criarMembro(dados) {
  return api.post("/equipe", dados);
}

export async function listarRoles() {
  return api.get("/roles");
}

export async function atribuirPapel(equipeId, roleId) {
    return api.post(`/equipe/${equipeId}/roles`, { roleId }); // ← CORRETO
  }
  

export async function atualizarMembro(id, dados) {
    return api.put(`/equipe/${id}`, dados);
  }
  
  export async function removerTodosOsPapeis(equipeId) {
    return api.delete(`/equipe/${equipeId}/roles`);
  }

export async function deletarMembro(id) {
    return api.delete(`/equipe/${id}`);
  }
  
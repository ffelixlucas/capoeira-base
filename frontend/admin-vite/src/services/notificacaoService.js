import api from "./api"; // axios configurado com baseURL e interceptors

// Lista todos os e-mails de notificação por grupo e tipo
export async function listarNotificacoes(grupoId, tipo) {
  const res = await api.get(`/notificacoes/${grupoId}/${tipo}`);
  return res.data;
}

// Adiciona um novo e-mail de notificação
export async function adicionarNotificacao(data) {
  const res = await api.post("/notificacoes", data);
  return res.data;
}

// Remove um e-mail de notificação
export async function removerNotificacao(id) {
  await api.delete(`/notificacoes/${id}`);
  return true;
}

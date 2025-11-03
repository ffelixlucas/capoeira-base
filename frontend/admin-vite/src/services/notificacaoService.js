import api from "./api";
import { logger } from "../utils/logger";

// Lista todos os e-mails de notificação por grupo e tipo
export async function listarNotificacoes(grupoId, tipo) {
  const res = await api.get(
    `${import.meta.env.VITE_API_URL}/notificacoes/${grupoId}/${tipo}`
  );
  return res.data;
}

// Adiciona um novo e-mail de notificação
export async function adicionarNotificacao(data) {
  const res = await api.post(
    `${import.meta.env.VITE_API_URL}/notificacoes`,
    data
  );
  return res.data;
}

// Remove um e-mail de notificação
export async function removerNotificacao(id) {
  await api.delete(`${import.meta.env.VITE_API_URL}/notificacoes/${id}`);
  return true;
}

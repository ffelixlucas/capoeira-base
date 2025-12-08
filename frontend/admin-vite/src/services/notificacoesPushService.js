import api from "./api";

export async function salvarSubscription(subscription) {
  return api.post("/notificacoes-push/salvar", subscription);
}

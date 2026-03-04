import api from "./api";

export async function buscarContatoOrganizacao() {
  const { data } = await api.get("/organizacoes/me/contato");
  return data?.data || null;
}

export async function atualizarContatoOrganizacao(payload) {
  const { data } = await api.put("/organizacoes/me/contato", payload);
  return data?.data || null;
}

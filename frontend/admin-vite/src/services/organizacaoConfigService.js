import api from "./api";

export async function buscarContatoOrganizacao() {
  const { data } = await api.get("/organizacoes/me/contato");
  return data?.data || null;
}

export async function atualizarContatoOrganizacao(payload) {
  const { data } = await api.put("/organizacoes/me/contato", payload);
  return data?.data || null;
}

export async function buscarMercadoPagoOrganizacao() {
  const { data } = await api.get("/organizacoes/me/pagamentos/mercado-pago");
  return data?.data || null;
}

export async function atualizarMercadoPagoOrganizacao(payload) {
  const { data } = await api.put(
    "/organizacoes/me/pagamentos/mercado-pago",
    payload
  );
  return data?.data || null;
}

export async function buscarMercadoPagoPublico(slug) {
  const { data } = await api.get(
    `/public/organizacoes/${slug}/pagamentos/mercado-pago`
  );
  return data?.data || null;
}

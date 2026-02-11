import api from "../api";

export async function listarSkus(slug) {
  const response = await api.get(
    `/public/loja/${slug}/skus`
  );
  return response.data;
}

export async function buscarSkuPorId(slug, id) {
  const response = await api.get(
    `/public/loja/${slug}/sku/${id}`
  );
  return response.data;
}


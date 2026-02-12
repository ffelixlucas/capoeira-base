import api from "../../api.js"; 

export async function criarPedido(slug, dados) {
  const response = await api.post(
    `/public/pedidos/${slug}/finalizar`,
    dados
  );
  return response.data;
}

export async function criarCobranca(slug, dados) {
  const response = await api.post(
    `/pagamentos/${slug}`,
    dados
  );
  return response.data;
}

export async function gerarPix(slug, cobrancaId) {
  const response = await api.post(
    `/pagamentos/${slug}/${cobrancaId}/pix`
  );
  return response.data;
}

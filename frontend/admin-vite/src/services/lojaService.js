import api from "./api";

export async function buscarEstatisticasLoja() {
  const { data } = await api.get("/pedidos/estatisticas");
  return data.data;
}

export async function listarPedidosLoja(params = {}) {
  const { data } = await api.get("/pedidos", { params });
  return data.data;
}
export async function buscarPedidoLoja(pedidoId) {
  const { data } = await api.get(`/pedidos/${pedidoId}`);
  return data.data;
}
export async function marcarPedidoPronto(pedidoId) {
  await api.patch(`/pedidos/${pedidoId}/pronto-retirada`);
}
export async function marcarPedidoEntregue(pedidoId) {
  await api.patch(`/pedidos/${pedidoId}/entregue`);
}
export async function estornarPedido(pedidoId) {
  await api.patch(`/pedidos/${pedidoId}/estornar`);
}
import { buscarPedidoComItens } from "./pedidosRepository";

export async function buscarPedidoPorId(
  organizacaoId: number,
  pedidoId: number
) {
  return buscarPedidoComItens(organizacaoId, pedidoId);
}

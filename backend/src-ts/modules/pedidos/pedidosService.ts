import {
  buscarPedidoComItens,
  converterPedido,
} from "./pedidosRepository";
import { logger } from "../../utils/logger";

export async function buscarPedidoPorId(
  organizacaoId: number,
  pedidoId: number
) {
  return buscarPedidoComItens(organizacaoId, pedidoId);
}

export async function converterPedidoPorId(
  organizacaoId: number,
  pedidoId: number
) {
  const affectedRows = await converterPedido(organizacaoId, pedidoId);

  if (affectedRows === 1) {
    logger.info("[pedidosService] Pedido convertido", {
      organizacaoId,
      pedidoId,
    });
  } else {
    logger.info("[pedidosService] Pedido já convertido ou inexistente", {
      organizacaoId,
      pedidoId,
    });
  }

  return affectedRows;
}
import {
  buscarPedidoComItens,
  converterPedido, listarPedidosPorOrganizacao, atualizarStatusPedidoCancelado , buscarEstatisticasPedidos, atualizarStatusPedidoEntregue
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
export async function listarPedidosPorOrg(
  organizacaoId: number,
  filtros: {
    status?: string;
    status_operacional?: string;
    data_inicio?: string;
    data_fim?: string;
  }
) {
  logger.debug("[pedidosService] listando pedidos", {
    organizacaoId,
    filtros,
  });

  return listarPedidosPorOrganizacao(organizacaoId, filtros);
}

export async function cancelarPedidoPorId(
  organizacaoId: number,
  pedidoId: number
) {
  return await atualizarStatusPedidoCancelado(organizacaoId, pedidoId);
}
export async function obterEstatisticasPedidos(
  organizacaoId: number
) {
  logger.debug("[pedidosService] buscando estatísticas", {
    organizacaoId,
  });

  return await buscarEstatisticasPedidos(organizacaoId);
}
export async function marcarPedidoEntregue(
  pedidoId: number,
  organizacaoId: number
) {
  logger.info("[pedidosService] Marcando pedido como entregue", {
    organizacaoId,
    pedidoId,
  });

  return await atualizarStatusPedidoEntregue(
    organizacaoId,
    pedidoId
  );
}

import connection from "../../database/connection";
import logger from "../../utils/logger";

export async function buscarPedidoComItens(
  organizacaoId: number,
  pedidoId: number
) {
  logger.debug("[pedidosRepository] buscando pedido", {
    organizacaoId,
    pedidoId,
  });

  const [pedidoRows]: any = await connection.query(
    `
    SELECT *
    FROM pedidos
    WHERE id = ?
      AND organizacao_id = ?
    `,
    [pedidoId, organizacaoId]
  );

  if (pedidoRows.length === 0) {
    return null;
  }

  const pedido = pedidoRows[0];

  const [itens]: any = await connection.query(
    `
    SELECT
      pi.id,
      pi.sku_id,
      pi.quantidade,
      pi.preco_unitario
    FROM pedido_itens pi
    WHERE pi.pedido_id = ?
      AND pi.organizacao_id = ?
    `,
    [pedidoId, organizacaoId]
  );

  return {
    ...pedido,
    itens,
  };
}

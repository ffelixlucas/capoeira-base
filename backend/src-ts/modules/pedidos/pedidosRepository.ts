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
    FROM carrinhos
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
      ci.id,
      ci.sku_id,
      ci.quantidade,
      ci.preco_unitario
    FROM carrinho_itens ci
    WHERE ci.carrinho_id = ?
      AND ci.organizacao_id = ?
    `,
    [pedidoId, organizacaoId]
  );

  return {
    ...pedido,
    itens,
  };
}

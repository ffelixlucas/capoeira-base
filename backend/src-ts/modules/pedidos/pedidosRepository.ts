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

export async function converterPedido(
  organizacaoId: number,
  pedidoId: number
) {
  const [result]: any = await connection.query(
    `
    UPDATE pedidos
    SET status = 'convertido',
        convertido_em = NOW()
    WHERE id = ?
      AND organizacao_id = ?
      AND status = 'aberto'
    `,
    [pedidoId, organizacaoId]
  );

  return result.affectedRows;
}
export async function atualizarDadosPedidoAposPagamento(data: {
  organizacaoId: number;
  pedidoId: number;
  nome: string;
  telefone: string;
  email: string;
}) {
  const { organizacaoId, pedidoId, nome, telefone, email } = data;

  await connection.query(
    `
    UPDATE pedidos
    SET
      nome_cliente = ?,
      telefone = ?,
      email = ?,
      status_operacional = 'em_separacao'
    WHERE id = ?
      AND organizacao_id = ?
    `,
    [nome, telefone, email, pedidoId, organizacaoId]
  );
}

export async function marcarPedidoProntoRetirada(
  organizacaoId: number,
  pedidoId: number
) {
  await connection.query(
    `
    UPDATE pedidos
    SET status_operacional = 'pronto_retirada'
    WHERE id = ?
      AND organizacao_id = ?
      AND status_operacional = 'em_separacao'
    `,
    [pedidoId, organizacaoId]
  );
}

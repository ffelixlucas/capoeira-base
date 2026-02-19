import connection from "../../database/connection";
import { PoolConnection } from "mysql2/promise";
import logger from "../../utils/logger";

/* ======================================================
   Buscar Pedido com Itens
====================================================== */

export async function buscarPedidoComItens(
  organizacaoId: number,
  pedidoId: number
) {
  logger.debug("[pedidosRepository] buscando pedido", {
    organizacaoId,
    pedidoId,
  });

  const [pedidoRows]: any = await connection.pool.query(
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

  const [itens]: any = await connection.pool.query(
    `
    SELECT
      pi.id,
      pi.sku_id,
      pi.quantidade,
      pi.preco_unitario,
      p.nome AS nome_produto,
      ps.sku_codigo,
      ps.atributos
    FROM pedido_itens pi
    JOIN produtos_skus ps
      ON ps.id = pi.sku_id
      AND ps.organizacao_id = pi.organizacao_id
    JOIN produtos p
      ON p.id = ps.produto_id
      AND p.organizacao_id = ps.organizacao_id
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

/* ======================================================
   Converter Pedido (com suporte a transação)
====================================================== */

export async function converterPedido(
  organizacaoId: number,
  pedidoId: number,
  trx?: PoolConnection
) {
  const executor = trx ?? connection.pool;

  const [result]: any = await executor.query(
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

/* ======================================================
   Atualizar Dados Após Pagamento (com suporte a transação)
====================================================== */

export async function atualizarDadosPedidoAposPagamento(
  data: {
    organizacaoId: number;
    pedidoId: number;
    nome: string;
    telefone: string;
    email: string;
  },
  trx?: PoolConnection
) {
  const { organizacaoId, pedidoId, nome, telefone, email } = data;

  const executor = trx ?? connection.pool;

  await executor.query(
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

/* ======================================================
   Marcar Pedido Pronto Retirada
====================================================== */

export async function marcarPedidoProntoRetirada(
  organizacaoId: number,
  pedidoId: number
) {
  await connection.pool.query(
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

/* ======================================================
   Listar Pedidos
====================================================== */

export async function listarPedidosPorOrganizacao(
  organizacaoId: number,
  filtros: {
    status?: string;
    status_operacional?: string;
    data_inicio?: string;
    data_fim?: string;
  }
) {
  let sql = `
  SELECT 
    p.id,
    p.status,
    p.status_operacional,
    p.nome_cliente,
    p.telefone,
    p.email,
    p.criado_em,
    p.convertido_em,
    IFNULL(SUM(pi.quantidade * pi.preco_unitario), 0) AS valor_total,
    IFNULL(SUM(pi.quantidade), 0) AS total_itens,
    (
      SELECT pc.status
      FROM pagamentos_cobrancas pc
      WHERE pc.entidade_id = p.id
        AND pc.organizacao_id = p.organizacao_id
        AND pc.origem = 'loja'
      ORDER BY pc.id DESC
      LIMIT 1
    ) AS status_financeiro
  FROM pedidos p
  LEFT JOIN pedido_itens pi 
    ON pi.pedido_id = p.id
    AND pi.organizacao_id = p.organizacao_id
  WHERE p.organizacao_id = ?
`;

  const params: any[] = [organizacaoId];

  if (filtros.status) {
    sql += " AND status = ?";
    params.push(filtros.status);
  }

  if (filtros.status_operacional) {
    sql += " AND status_operacional = ?";
    params.push(filtros.status_operacional);
  }

  if (filtros.data_inicio) {
    sql += " AND DATE(criado_em) >= ?";
    params.push(filtros.data_inicio);
  }

  if (filtros.data_fim) {
    sql += " AND DATE(criado_em) <= ?";
    params.push(filtros.data_fim);
  }

  sql += " GROUP BY p.id";
  sql += " ORDER BY criado_em DESC";

  const [rows]: any = await connection.pool.query(sql, params);

  return rows;
}

/* ======================================================
   Cancelar Pedido
====================================================== */

export async function atualizarStatusPedidoCancelado(
  organizacaoId: number,
  pedidoId: number
) {
  const [result]: any = await connection.pool.query(
    `
    UPDATE pedidos
    SET 
      status = 'cancelado',
      status_operacional = 'cancelado'
    WHERE id = ?
      AND organizacao_id = ?
      AND status != 'cancelado'
    `,
    [pedidoId, organizacaoId]
  );

  return result.affectedRows;
}

/* ======================================================
   Estatísticas
====================================================== */

export async function buscarEstatisticasPedidos(
  organizacaoId: number
) {
  const [rows]: any = await connection.pool.query(
    `
    SELECT
      SUM(CASE WHEN p.status = 'convertido' THEN 1 ELSE 0 END) AS total_pedidos,
      SUM(CASE WHEN p.status_operacional = 'em_separacao' THEN 1 ELSE 0 END) AS em_separacao,
      SUM(CASE WHEN p.status_operacional = 'pronto_retirada' THEN 1 ELSE 0 END) AS pronto_retirada,
      SUM(CASE WHEN p.status_operacional = 'entregue' THEN 1 ELSE 0 END) AS entregues,
      SUM(CASE WHEN p.status = 'aberto' THEN 1 ELSE 0 END) AS pendentes
    FROM pedidos p
    WHERE p.organizacao_id = ?
    `,
    [organizacaoId]
  );

  return rows[0];
}

/* ======================================================
   Marcar Pedido Entregue
====================================================== */

export async function atualizarStatusPedidoEntregue(
  organizacaoId: number,
  pedidoId: number
) {
  const [result]: any = await connection.pool.query(
    `
    UPDATE pedidos
    SET status_operacional = 'entregue'
    WHERE id = ?
      AND organizacao_id = ?
      AND status_operacional = 'pronto_retirada'
    `,
    [pedidoId, organizacaoId]
  );

  return result.affectedRows;
}

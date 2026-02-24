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
      ps.sku_codigo
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
    SET 
      status_financeiro = 'pago',
      convertido_em = NOW()
    WHERE id = ?
      AND organizacao_id = ?
      AND status_financeiro = 'pendente'
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
   Listar Pedidos (Cursor Pagination)
====================================================== */

export async function listarPedidosPorOrganizacao(
  organizacaoId: number,
  filtros: {
    status_financeiro?: string;
    status_operacional?: string;
    data_inicio?: string;
    data_fim?: string;
  },
  cursor?: {
    criado_em: string;
    id: number;
  },
  limite: number = 20
) {
  let sql = `
  SELECT 
    p.id,
    p.status_financeiro,
    p.status_operacional,
    p.nome_cliente,
    p.telefone,
    p.email,
    p.criado_em,
    p.convertido_em,
    p.valor_total,
    p.total_itens
  FROM pedidos p
  WHERE p.organizacao_id = ?
`;

  const params: any[] = [organizacaoId];

  if (cursor) {
    sql += `
      AND (
        p.criado_em < ?
        OR (p.criado_em = ? AND p.id < ?)
      )
    `;
  
    const criadoEmDate = new Date(cursor.criado_em);
  
    const criadoEmMysql = criadoEmDate
      .toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" })
      .replace("T", " ");
  
    params.push(criadoEmMysql, criadoEmMysql, cursor.id);
  }

  if (filtros.status_financeiro) {
    sql += " AND p.status_financeiro = ?";
    params.push(filtros.status_financeiro);
  }

  if (filtros.status_operacional) {
    sql += " AND p.status_operacional = ?";
    params.push(filtros.status_operacional);
  }

  if (filtros.data_inicio) {
    sql += " AND DATE(p.criado_em) >= ?";
    params.push(filtros.data_inicio);
  }

  if (filtros.data_fim) {
    sql += " AND DATE(p.criado_em) <= ?";
    params.push(filtros.data_fim);
  }

  sql += `
    GROUP BY p.id
    ORDER BY p.criado_em DESC, p.id DESC
    LIMIT ?
  `;

  params.push(limite);

  logger.debug("[pedidosRepository] SQL", { sql, params });
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
      status_financeiro = 'cancelado'
    WHERE id = ?
      AND organizacao_id = ?
      AND status_financeiro != 'cancelado'
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
      SUM(CASE WHEN p.status_financeiro = 'pago' THEN 1 ELSE 0 END) AS total_pedidos,
      SUM(CASE WHEN p.status_operacional = 'em_separacao' THEN 1 ELSE 0 END) AS em_separacao,
      SUM(CASE WHEN p.status_operacional = 'pronto_retirada' THEN 1 ELSE 0 END) AS pronto_retirada,
      SUM(CASE WHEN p.status_operacional = 'finalizado' THEN 1 ELSE 0 END) AS finalizados,
      SUM(CASE WHEN p.status_financeiro = 'pendente' THEN 1 ELSE 0 END) AS pendentes
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
/* ======================================================
   Atualizar Pedido para Estornado (com suporte a transação)
====================================================== */

export async function atualizarPedidoEstornado(
  organizacaoId: number,
  pedidoId: number,
  trx?: PoolConnection
) {
  const executor = trx ?? connection.pool;

  const [result]: any = await executor.query(
    `
    UPDATE pedidos
    SET 
      status_financeiro = 'estornado'
    WHERE id = ?
      AND organizacao_id = ?
      AND status_financeiro = 'pago'
    `,
    [pedidoId, organizacaoId]
  );

  return result.affectedRows;
}
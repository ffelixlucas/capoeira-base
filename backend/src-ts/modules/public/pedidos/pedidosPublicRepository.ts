import { db } from "../../../database/connection";

type SkuRow = {
  id: number;
  preco: number;
  ativo: number;
};

type CriarPedidoItensInput = {
  organizacaoId: number;
  pedidoId: number;
  itens: {
    sku_id: number;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
  }[];
};

export async function buscarOrganizacaoPorSlug(slug: string) {
  const [rows]: any = await db.query(
    `
    SELECT id
    FROM organizacoes
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return rows.length ? rows[0] : null;
}

export async function buscarSkusPorIds(
  organizacaoId: number,
  skuIds: number[]
): Promise<SkuRow[]> {
  const placeholders = skuIds.map(() => "?").join(",");

  const [rows] = await db.query(
    `
    SELECT id, preco, ativo
    FROM produtos_skus
    WHERE organizacao_id = ?
      AND id IN (${placeholders})
    `,
    [organizacaoId, ...skuIds]
  );

  return rows as SkuRow[];
}

export async function criarPedido(data: { organizacaoId: number }) {
  const { organizacaoId } = data;

  const [result]: any = await db.query(
    `
    INSERT INTO pedidos
      (organizacao_id, status, criado_em)
    VALUES (?, 'aberto', NOW())
    `,
    [organizacaoId]
  );

  return { id: result.insertId };
}

export async function criarPedidoItens(data: {
  organizacaoId: number;
  pedidoId: number;
  itens: {
    sku_id: number;
    quantidade: number;
    preco_unitario: number;
  }[];
}) {
  const { organizacaoId, pedidoId, itens } = data;

  const values = itens.map((item) => [
    organizacaoId,
    pedidoId,
    item.sku_id,
    item.quantidade,
    item.preco_unitario,
  ]);

  await db.query(
    `
    INSERT INTO pedido_itens
      (organizacao_id, pedido_id, sku_id, quantidade, preco_unitario)
    VALUES ?
    `,
    [values]
  );
}


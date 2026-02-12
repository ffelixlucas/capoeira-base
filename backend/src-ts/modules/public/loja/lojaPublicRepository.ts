import { db } from "../../../database/connection";

export interface LojaSkuRow {
  id: number;
  produto_id: number;
  produto_nome: string;
  produto_descricao: string | null;
  produto_categoria: string | null;
  sku_codigo: string;
  preco: number;
  atributos: any;
  pronta_entrega: number;
  encomenda: number;
}

class LojaPublicRepository {
  async listarSkusDisponiveisPorSlug(
    slug: string
  ): Promise<LojaSkuRow[]> {
    const [rows] = await db.query(
      `
      SELECT
        ps.id,
        ps.produto_id,
        p.nome        AS produto_nome,
        p.descricao   AS produto_descricao,
        p.categoria   AS produto_categoria,
        ps.sku_codigo,
        ps.preco,
        ps.atributos,
        ps.pronta_entrega,
        ps.encomenda
      FROM produtos_skus ps
      INNER JOIN produtos p
        ON p.id = ps.produto_id
      INNER JOIN organizacoes o
        ON o.id = ps.organizacao_id
      WHERE o.slug = ?
        AND ps.ativo = 1
        AND (ps.pronta_entrega = 1 OR ps.encomenda = 1)
        AND p.ativo = 1
      ORDER BY p.nome ASC, ps.id DESC
      `,
      [slug]
    );

    return rows as LojaSkuRow[];
  }
  async buscarSkuPorId(slug: string, skuId: number) {
  const query = `
    SELECT 
      ps.id,
      ps.produto_id,
      p.nome AS produto_nome,
      p.descricao AS produto_descricao,
      p.categoria AS produto_categoria,
      ps.sku_codigo,
      ps.preco,
      ps.atributos,
      ps.pronta_entrega,
      ps.encomenda
    FROM produtos_skus ps
    JOIN produtos p ON p.id = ps.produto_id
    JOIN organizacoes o ON o.id = p.organizacao_id
    WHERE o.slug = ?
      AND ps.id = ?
      AND p.ativo = 1
  `;

  const [rows]: any = await db.execute(query, [slug, skuId]);

  return rows[0] || null;
}

async listarProdutosDisponiveisPorSlug(slug: string) {
  const [rows] = await db.query(
    `
    SELECT
      p.id,
      p.nome,
      p.descricao,
      p.categoria,
      MIN(ps.preco) AS preco_minimo
    FROM produtos p
    INNER JOIN produtos_skus ps
      ON ps.produto_id = p.id
    INNER JOIN organizacoes o
      ON o.id = p.organizacao_id
    WHERE o.slug = ?
      AND p.ativo = 1
      AND ps.ativo = 1
      AND (ps.pronta_entrega = 1 OR ps.encomenda = 1)
    GROUP BY p.id, p.nome, p.descricao, p.categoria
    ORDER BY p.nome ASC
    `,
    [slug]
  );

  return rows;
}

async buscarProdutoComSkus(slug: string, produtoId: number) {
  const [produtoRows]: any = await db.query(
    `
    SELECT 
      p.id,
      p.nome,
      p.descricao,
      p.categoria
    FROM produtos p
    JOIN organizacoes o ON o.id = p.organizacao_id
    WHERE o.slug = ?
      AND p.id = ?
      AND p.ativo = 1
    `,
    [slug, produtoId]
  );

  if (!produtoRows.length) {
    return null;
  }

  const [skuRows]: any = await db.query(
    `
    SELECT
      ps.id,
      ps.sku_codigo,
      ps.preco,
      ps.atributos,
      ps.pronta_entrega,
      ps.encomenda
    FROM produtos_skus ps
    JOIN organizacoes o ON o.id = ps.organizacao_id
    WHERE o.slug = ?
      AND ps.produto_id = ?
      AND ps.ativo = 1
      AND (ps.pronta_entrega = 1 OR ps.encomenda = 1)
    ORDER BY ps.id DESC
    `,
    [slug, produtoId]
  );

  return {
    produto: produtoRows[0],
    skus: skuRows,
  };
}

}

export default new LojaPublicRepository();

import { db } from "../../../database/connection";

export interface LojaSkuRow {
  id: number;
  produto_id: number;
  produto_nome: string;
  produto_descricao: string | null;
  produto_categoria: string | null;
  sku_codigo: string;
  preco: number;
  pronta_entrega: number;
  encomenda: number;
  quantidade_disponivel: number;
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
        ps.pronta_entrega,
        ps.encomenda,
        COALESCE(e.quantidade, 0) AS quantidade_disponivel
      FROM produtos_skus ps
      INNER JOIN produtos p
        ON p.id = ps.produto_id
      INNER JOIN organizacoes o
        ON o.id = ps.organizacao_id
      LEFT JOIN estoque e
        ON e.sku_id = ps.id
        AND e.organizacao_id = ps.organizacao_id
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

  // 🔹 NECESSÁRIO para o service não quebrar
  async buscarSkuPorId(slug: string, skuId: number) {

    const [rows]: any = await db.query(
      `
      SELECT
        ps.id,
        ps.produto_id,
        p.nome AS produto_nome,
        p.descricao AS produto_descricao,
        p.categoria AS produto_categoria,
        ps.sku_codigo,
        ps.preco,
        ps.pronta_entrega,
        ps.encomenda,
        COALESCE(e.quantidade, 0) AS quantidade_disponivel
      FROM produtos_skus ps
      JOIN produtos p ON p.id = ps.produto_id
      JOIN organizacoes o ON o.id = p.organizacao_id
      LEFT JOIN estoque e
        ON e.sku_id = ps.id
        AND e.organizacao_id = ps.organizacao_id
      WHERE o.slug = ?
        AND ps.id = ?
        AND p.ativo = 1
      `,
      [slug, skuId]
    );

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
        MIN(ps.preco) AS preco_minimo,
        SUM(
          CASE 
            WHEN ps.encomenda = 1 THEN 9999
            ELSE COALESCE(e.quantidade, 0)
          END
        ) AS quantidade_total
      FROM produtos p
      INNER JOIN produtos_skus ps
        ON ps.produto_id = p.id
      INNER JOIN organizacoes o
        ON o.id = p.organizacao_id
      LEFT JOIN estoque e
        ON e.sku_id = ps.id
        AND e.organizacao_id = ps.organizacao_id
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
        ps.pronta_entrega,
        ps.encomenda,
        COALESCE(e.quantidade, 0) AS quantidade_disponivel
      FROM produtos_skus ps
      JOIN organizacoes o ON o.id = ps.organizacao_id
      LEFT JOIN estoque e
        ON e.sku_id = ps.id
        AND e.organizacao_id = ps.organizacao_id
      WHERE o.slug = ?
        AND ps.produto_id = ?
        AND ps.ativo = 1
        AND (ps.pronta_entrega = 1 OR ps.encomenda = 1)
      ORDER BY ps.id DESC
      `,
      [slug, produtoId]
    );

    if (!skuRows.length) {
      return {
        ...produtoRows[0],
        skus: []
      };
    }

    const skuIds = skuRows.map((s: any) => s.id);

    const [variacoesRows]: any = await db.query(
      `
      SELECT
        sv.sku_id,
        vt.nome AS tipo,
        vv.valor
      FROM sku_variacoes sv
      JOIN variacoes_valores vv
        ON vv.id = sv.variacao_valor_id
      JOIN variacoes_tipos vt
        ON vt.id = vv.variacao_tipo_id
      WHERE sv.sku_id IN (?)
      `,
      [skuIds]
    );

    const skusComVariacoes = skuRows.map((sku: any) => {
      const variacoes = variacoesRows
        .filter((v: any) => v.sku_id === sku.id)
        .map((v: any) => ({
          tipo: v.tipo,
          valor: v.valor
        }));

      return {
        ...sku,
        variacoes
      };
    });

    return {
      ...produtoRows[0],
      skus: skusComVariacoes
    };
  }
}

export default new LojaPublicRepository();
import { db } from "../../../database/connection";

export interface LojaSkuRow {
  id: number;
  produto_id: number;
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
        ps.sku_codigo,
        ps.preco,
        ps.atributos,
        ps.pronta_entrega,
        ps.encomenda
      FROM produtos_skus ps
      INNER JOIN organizacoes o
        ON o.id = ps.organizacao_id
      WHERE o.slug = ?
        AND ps.ativo = 1
        AND (ps.pronta_entrega = 1 OR ps.encomenda = 1)
      ORDER BY ps.id DESC
      `,
      [slug]
    );

    return rows as LojaSkuRow[];
  }
}

export default new LojaPublicRepository();

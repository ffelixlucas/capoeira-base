import { db } from "../../../database/connection";

type SkuRow = {
  id: number;
  preco: number;
  ativo: number;
};

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

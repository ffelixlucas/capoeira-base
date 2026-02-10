import db from "../../database/connection";
import logger from "../../utils/logger";

interface BaixarEstoqueParams {
  pedidoId: number;
  organizacaoId: number;
}

async function baixarEstoquePorPedido({
  pedidoId,
  organizacaoId,
}: BaixarEstoqueParams) {
  try {
    logger.debug("[estoqueRepository] Iniciando baixa de estoque", {
      pedidoId,
      organizacaoId,
    });

    await db.query("START TRANSACTION");

    const [itens]: any = await db.query(
      `
      SELECT 
        pi.sku_id,
        pi.quantidade,
        ps.encomenda
      FROM pedido_itens pi
      JOIN produtos_skus ps ON ps.id = pi.sku_id
      WHERE pi.pedido_id = ?
        AND pi.organizacao_id = ?
      `,
      [pedidoId, organizacaoId]
    );

    for (const item of itens) {
      if (item.encomenda === 1) {
        logger.debug("[estoqueRepository] SKU encomenda, ignorando estoque", {
          skuId: item.sku_id,
        });
        continue;
      }

      await db.query(
        `
        INSERT INTO estoque_movimentacoes
          (organizacao_id, sku_id, pedido_id, tipo, quantidade, origem)
        VALUES (?, ?, ?, 'saida', ?, 'loja')
        `,
        [organizacaoId, item.sku_id, pedidoId, item.quantidade]
      );

      await db.query(
        `
        UPDATE estoque
        SET quantidade = quantidade - ?
        WHERE sku_id = ?
          AND organizacao_id = ?
        `,
        [item.quantidade, item.sku_id, organizacaoId]
      );
    }

    await db.query("COMMIT");

    logger.info("[estoqueRepository] Baixa de estoque concluída", {
      pedidoId,
      organizacaoId,
    });
  } catch (error) {
    await db.query("ROLLBACK");

    logger.error("[estoqueRepository] Erro ao baixar estoque", {
      pedidoId,
      organizacaoId,
      error,
    });

    throw error;
  }
}

export default {
  baixarEstoquePorPedido,
};

import db from "../../database/connection";
import logger from "../../utils/logger";
import { PoolConnection } from "mysql2/promise";

interface BaixarEstoqueParams {
  pedidoId: number;
  organizacaoId: number;
}

async function baixarEstoquePorPedido(
  {
    pedidoId,
    organizacaoId,
  }: BaixarEstoqueParams,
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  try {
    logger.debug("[estoqueRepository] Iniciando baixa de estoque", {
      pedidoId,
      organizacaoId,
    });

    const [itens]: any = await executor.query(
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

      // 🔒 UPDATE CONDICIONAL (bloqueio de estoque negativo)
      const [updateResult]: any = await executor.query(
        `
        UPDATE estoque
        SET quantidade = quantidade - ?
        WHERE sku_id = ?
          AND organizacao_id = ?
          AND quantidade >= ?
        `,
        [
          item.quantidade,
          item.sku_id,
          organizacaoId,
          item.quantidade,
        ]
      );

      if (updateResult.affectedRows === 0) {
        logger.error("[estoqueRepository] Estoque insuficiente", {
          skuId: item.sku_id,
          quantidadeSolicitada: item.quantidade,
        });

        throw new Error(
          `Estoque insuficiente para SKU ${item.sku_id}`
        );
      }

      // 📦 Registrar movimentação somente após sucesso
      await executor.query(
        `
        INSERT INTO estoque_movimentacoes
          (organizacao_id, sku_id, pedido_id, tipo, quantidade, origem)
        VALUES (?, ?, ?, 'saida', ?, 'loja')
        `,
        [organizacaoId, item.sku_id, pedidoId, item.quantidade]
      );
    }

    logger.info("[estoqueRepository] Baixa de estoque concluída", {
      pedidoId,
      organizacaoId,
    });

  } catch (error) {
    logger.error("[estoqueRepository] Erro ao baixar estoque", {
      pedidoId,
      organizacaoId,
      error,
    });

    throw error;
  }
}

async function reverterEstoque(
  organizacaoId: number,
  skuId: number,
  quantidade: number,
  pedidoId: number,
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  // 🔄 Devolve quantidade ao estoque
  await executor.query(
    `
    UPDATE estoque
    SET quantidade = quantidade + ?
    WHERE sku_id = ?
      AND organizacao_id = ?
    `,
    [quantidade, skuId, organizacaoId]
  );

  // 📦 Registrar movimentação de entrada
  await executor.query(
    `
    INSERT INTO estoque_movimentacoes
      (organizacao_id, sku_id, pedido_id, tipo, quantidade, origem)
    VALUES (?, ?, ?, 'entrada', ?, 'estorno')
    `,
    [organizacaoId, skuId, pedidoId, quantidade]
  );

  logger.info("[estoqueRepository] Estoque revertido", {
    organizacaoId,
    skuId,
    quantidade,
    pedidoId,
  });
}

async function entradaManualEstoque(
  organizacaoId: number,
  skuId: number,
  quantidade: number,
  motivo: string,
  trx?: PoolConnection
) {
  if (!trx) {
    throw new Error("Transação obrigatória para entrada manual de estoque");
  }

  const executor = trx;

  if (quantidade <= 0) {
    throw new Error("Quantidade deve ser maior que zero");
  }

  // 🔄 Atualiza estoque (com verificação)
  const [updateResult]: any = await executor.query(
    `
    UPDATE estoque
    SET quantidade = quantidade + ?
    WHERE sku_id = ?
      AND organizacao_id = ?
    `,
    [quantidade, skuId, organizacaoId]
  );

  if (updateResult.affectedRows === 0) {
    throw new Error("SKU não encontrado no estoque");
  }

  // 📦 Registrar movimentação
  await executor.query(
    `
    INSERT INTO estoque_movimentacoes
      (organizacao_id, sku_id, tipo, quantidade, origem)
    VALUES (?, ?, 'entrada', ?, ?)
    `,
    [organizacaoId, skuId, quantidade, motivo]
  );
  logger.info("[estoqueRepository] Entrada manual registrada", {
    organizacaoId,
    skuId,
    quantidade,
    motivo,
  });
}

export {
  reverterEstoque,
  entradaManualEstoque,
};

export default {
  baixarEstoquePorPedido,
};
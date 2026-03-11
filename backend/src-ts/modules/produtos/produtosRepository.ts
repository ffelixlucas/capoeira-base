import db from "../../database/connection";
import logger from "../../utils/logger";
import { PoolConnection } from "mysql2/promise";

/**
 * LISTAR PRODUTOS (com SKUs)
 */
async function listarProdutos(
  organizacaoId: number,
  isPublic: boolean = false
) {
  const queryProdutos = isPublic
    ? `
      SELECT 
        p.id,
        p.nome,
        p.descricao,
        p.categoria,
        p.tipo_produto,
        p.ativo,
        p.created_at
      FROM produtos p
      WHERE p.organizacao_id = ?
        AND p.ativo = 1
      ORDER BY p.created_at DESC
    `
    : `
      SELECT 
        p.id,
        p.nome,
        p.descricao,
        p.categoria,
        p.tipo_produto,
        p.ativo,
        p.created_at
      FROM produtos p
      WHERE p.organizacao_id = ?
      ORDER BY p.created_at DESC
    `;

  const [produtos]: any = await db.pool.query(
    queryProdutos,
    [organizacaoId]
  );

  // 🔹 MODO PÚBLICO (leve, apenas capa)
  if (isPublic) {
    const [capas]: any = await db.pool.query(
      `
      SELECT 
        pi.produto_id,
        pi.url
      FROM produto_imagens pi
      WHERE pi.organizacao_id = ?
        AND pi.is_capa = 1
      `,
      [organizacaoId]
    );

    const produtosComCapa = produtos.map((produto: any) => {
      const capa = capas.find(
        (c: any) => c.produto_id === produto.id
      );

      return {
        ...produto,
        capa: capa ? capa.url : null,
      };
    });

    logger.debug("[produtosRepository] Produtos listados modo público", {
      organizacaoId,
      total: produtosComCapa.length,
    });

    return produtosComCapa;
  }

  // 🔹 MODO ADMIN (completo)
  const [skus]: any = await db.pool.query(
    `
    SELECT 
      ps.id,
      ps.produto_id,
      ps.sku_codigo,
      ps.preco,
      ps.pronta_entrega,
      ps.encomenda,
      ps.ativo,
      COALESCE(e.quantidade, 0) AS quantidade
    FROM produtos_skus ps
    LEFT JOIN estoque e
      ON e.sku_id = ps.id
      AND e.organizacao_id = ?
    WHERE ps.organizacao_id = ?
    `,
    [organizacaoId, organizacaoId]
  );

  const produtosMap = produtos.map((produto: any) => ({
    ...produto,
    skus: skus.filter(
      (sku: any) => sku.produto_id === produto.id
    ),
  }));

  logger.debug("[produtosRepository] Produtos listados modo admin", {
    organizacaoId,
    total: produtosMap.length,
  });

  return produtosMap;
}

/**
 * BUSCAR PRODUTO POR ID
 */
async function buscarProdutoPorId(
  organizacaoId: number,
  produtoId: number
) {

  const [produtos]: any = await db.pool.query(
    `
    SELECT *
    FROM produtos
    WHERE id = ?
      AND organizacao_id = ?

    `,
    [produtoId, organizacaoId]
  );

  // 🔹 Buscar imagens do produto
  const [imagens]: any = await db.pool.query(
    `
  SELECT id, url, ordem, is_capa
  FROM produto_imagens
  WHERE produto_id = ?
    AND organizacao_id = ?
  ORDER BY ordem ASC
  `,
    [produtoId, organizacaoId]
  );

  if (produtos.length === 0) {
    return null;
  }

  // 🔹 Buscar SKUs
  const [skus]: any = await db.pool.query(
    `
    SELECT 
      ps.id,
      ps.produto_id,
      ps.sku_codigo,
      ps.preco,
      ps.pronta_entrega,
      ps.encomenda,
      ps.ativo,
      COALESCE(e.quantidade, 0) AS quantidade
    FROM produtos_skus ps
    LEFT JOIN estoque e
      ON e.sku_id = ps.id
      AND e.organizacao_id = ?
    WHERE ps.produto_id = ?
      AND ps.organizacao_id = ?
    `,
    [organizacaoId, produtoId, organizacaoId]
  );

  // 🔹 Buscar variações vinculadas às SKUs
  const [variacoes]: any = await db.pool.query(
    `
    SELECT
      sv.sku_id,
      vt.id AS tipo_id,
      vt.nome AS tipo,
      vv.id AS valor_id,
      vv.valor
    FROM sku_variacoes sv
    JOIN variacoes_valores vv
      ON vv.id = sv.variacao_valor_id
    JOIN variacoes_tipos vt
      ON vt.id = vv.variacao_tipo_id
    WHERE sv.organizacao_id = ?
      AND sv.sku_id IN (
        SELECT id
        FROM produtos_skus
        WHERE produto_id = ?
          AND organizacao_id = ?
      )
    `,
    [organizacaoId, produtoId, organizacaoId]
  );

  // 🔹 Buscar imagens das SKUs
  const [skuImagens]: any = await db.pool.query(
    `
  SELECT id, sku_id, url, ordem, is_capa
  FROM sku_imagens
  WHERE organizacao_id = ?
    AND sku_id IN (
      SELECT id
      FROM produtos_skus
      WHERE produto_id = ?
        AND organizacao_id = ?
    )
  ORDER BY ordem ASC
  `,
    [organizacaoId, produtoId, organizacaoId]
  );

  // 🔹 Agrupar variações por SKU
  const skusComVariacoes = await Promise.all(
    skus.map(async (sku: any) => {
  
      const variacoesDaSku = variacoes
        .filter((v: any) => v.sku_id === sku.id)
        .map((v: any) => ({
          tipo_id: v.tipo_id,
          tipo: v.tipo,
          valor_id: v.valor_id,
          valor: v.valor
        }));
  
      const imagensDaSku = skuImagens
        .filter((img: any) => img.sku_id === sku.id);
  
      const totalPedidos = await contarPedidosPorSku(organizacaoId, sku.id);
  
      return {
        ...sku,
        imagens: imagensDaSku,
        variacoes: variacoesDaSku,
        possuiPedidos: totalPedidos > 0
      };
    })
  );

  return {
    ...produtos[0],
    imagens,
    skus: skusComVariacoes,
  };
}

/**
 * CRIAR PRODUTO
 */
async function criarProduto(
  organizacaoId: number,
  nome: string,
  descricao: string,
  categoria: string,
  ativo: number,
  tipoProduto: "simples" | "variavel",
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  const [result]: any = await executor.query(
    `
    INSERT INTO produtos
      (organizacao_id, nome, descricao, categoria, ativo, tipo_produto)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [organizacaoId, nome, descricao, categoria, ativo, tipoProduto]
  );

  logger.info("[produtosRepository] Produto criado", {
    organizacaoId,
    produtoId: result.insertId,
    tipoProduto,
  });

  return result.insertId;
}

/**
 * CRIAR SKU
 */
async function criarSku(
  organizacaoId: number,
  produtoId: number,
  skuCodigo: string,
  preco: number,
  prontaEntrega: number,
  encomenda: number,
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  const [result]: any = await executor.query(
    `
    INSERT INTO produtos_skus
      (organizacao_id, produto_id, sku_codigo, preco, pronta_entrega, encomenda)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      organizacaoId,
      produtoId,
      skuCodigo,
      preco,
      prontaEntrega,
      encomenda,
    ]
  );

  logger.info("[produtosRepository] SKU criada", {
    organizacaoId,
    skuId: result.insertId,
  });

  return result.insertId;
}

/**
 * CRIAR ESTOQUE INICIAL
 */
async function criarEstoqueInicial(
  organizacaoId: number,
  skuId: number,
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  await executor.query(
    `
    INSERT INTO estoque
      (organizacao_id, sku_id, quantidade)
    VALUES (?, ?, 0)
    `,
    [organizacaoId, skuId]
  );

  logger.debug("[produtosRepository] Estoque inicial criado", {
    organizacaoId,
    skuId,
  });
}

/**
 * ATUALIZAR PRODUTO
 */
async function atualizarProduto(
  organizacaoId: number,
  produtoId: number,
  nome: string,
  descricao: string,
  categoria: string,
  ativo: number,
  trx?: PoolConnection

) {
  const executor = trx ?? db.pool;

  await executor.query(
    `
    UPDATE produtos
    SET nome = ?,
        descricao = ?,
        categoria = ?,
        ativo = ?
    WHERE id = ?
          AND organizacao_id = ?
          
    `,
    [nome, descricao, categoria, ativo, produtoId, organizacaoId]
  );

  logger.debug("[produtosRepository] Produto atualizado", {
    organizacaoId,
    produtoId,
  });
}

/**
 * ATUALIZAR SKU (preço + encomenda)
 */
async function atualizarSku(
  organizacaoId: number,
  skuId: number,
  preco: number,
  encomenda: number,
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  await executor.query(
    `
    UPDATE produtos_skus
    SET preco = ?,
        encomenda = ?
    WHERE id = ?
      AND organizacao_id = ?
    `,
    [preco, encomenda, skuId, organizacaoId]
  );

  logger.debug("[produtosRepository] SKU atualizada", {
    organizacaoId,
    skuId,
  });
}

/**
 * ATUALIZAR ESTOQUE DIRETO (valor final)
 */
async function atualizarEstoqueDireto(
  organizacaoId: number,
  skuId: number,
  quantidade: number,
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  await executor.query(
    `
    UPDATE estoque
    SET quantidade = ?
    WHERE sku_id = ?
      AND organizacao_id = ?
    `,
    [quantidade, skuId, organizacaoId]
  );

  logger.debug("[produtosRepository] Estoque atualizado diretamente", {
    organizacaoId,
    skuId,
    quantidade,
  });
}

async function vincularSkuVariacao(
  organizacaoId: number,
  skuId: number,
  variacaoValorId: number,
  connection: any
) {
  const sql = `
    INSERT INTO sku_variacoes
      (organizacao_id, sku_id, variacao_valor_id)
    VALUES (?, ?, ?)
  `;

  await connection.query(sql, [
    organizacaoId,
    skuId,
    variacaoValorId,
  ]);
}


async function contarPedidosPorSku(
  organizacaoId: number,
  skuId: number
): Promise<number> {
  const [rows]: any = await db.pool.query(
    `
    SELECT COUNT(*) as total
    FROM pedido_itens pi
    INNER JOIN produtos_skus ps ON ps.id = pi.sku_id
    WHERE ps.organizacao_id = ?
      AND ps.id = ?
    `,
    [organizacaoId, skuId]
  );

  return rows[0]?.total || 0;
}

/**
 * REATIVAR SKU
 */
async function reativarSku(
  organizacaoId: number,
  skuId: number,
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  await executor.query(
    `
    UPDATE produtos_skus
    SET ativo = 1
    WHERE id = ?
      AND organizacao_id = ?
    `,
    [skuId, organizacaoId]
  );

  logger.info("[produtosRepository] SKU reativada", {
    organizacaoId,
    skuId,
  });
}

/**
 * DESATIVAR SKU
 */
async function desativarSku(
  organizacaoId: number,
  skuId: number,
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  await executor.query(
    `
    UPDATE produtos_skus
    SET ativo = 0
    WHERE id = ?
      AND organizacao_id = ?
    `,
    [skuId, organizacaoId]
  );

  logger.info("[produtosRepository] SKU desativada", {
    organizacaoId,
    skuId,
  });
}


export {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  criarSku,
  criarEstoqueInicial,
  atualizarSku,
  atualizarProduto,
  atualizarEstoqueDireto,
  vincularSkuVariacao,
  contarPedidosPorSku,
  reativarSku,
  desativarSku
};

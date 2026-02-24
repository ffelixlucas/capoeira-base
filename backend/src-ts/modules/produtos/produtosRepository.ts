import db from "../../database/connection";
import logger from "../../utils/logger";
import { PoolConnection } from "mysql2/promise";

/**
 * LISTAR PRODUTOS (com SKUs)
 */
async function listarProdutos(organizacaoId: number) {
  const [produtos]: any = await db.pool.query(
    `
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
    `,
    [organizacaoId]
  );

  const [skus]: any = await db.pool.query(
    `
    SELECT 
      ps.id,
      ps.produto_id,
      ps.sku_codigo,
      ps.preco,
      ps.pronta_entrega,
      ps.encomenda,
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

  logger.debug("[produtosRepository] Produtos listados", {
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
      vt.nome AS tipo,
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

  // 🔹 Agrupar variações por SKU
  const skusComVariacoes = skus.map((sku: any) => {

    const variacoesDaSku = variacoes
      .filter((v: any) => v.sku_id === sku.id)
      .map((v: any) => ({
        tipo: v.tipo,
        valor: v.valor
      }));

    return {
      ...sku,
      variacoes: variacoesDaSku
    };
  });

  return {
    ...produtos[0],
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
 * ATUALIZAR SKU (preço)
 */
async function atualizarSku(
  organizacaoId: number,
  skuId: number,
  preco: number,
  trx?: PoolConnection
) {
  const executor = trx ?? db.pool;

  await executor.query(
    `
    UPDATE produtos_skus
    SET preco = ?
    WHERE id = ?
      AND organizacao_id = ?
    `,
    [preco, skuId, organizacaoId]
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
};
import db from "../../database/connection";
import logger from "../../utils/logger";
import {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  criarSku,
  criarEstoqueInicial,
  atualizarSku,
  atualizarProduto,        
  atualizarEstoqueDireto,
  vincularSkuVariacao   
} from "./produtosRepository";

interface CriarProdutoInput {
  organizacaoId: number;
  nome: string;
  descricao: string;
  categoria: string;
  tipo_produto: "simples" | "variavel";
  ativo?: number;
}

interface CriarSkuInput {
  organizacaoId: number;
  produtoId: number;
  skuCodigo: string;
  preco: number;
  prontaEntrega: number;
  encomenda: number;
}

interface AtualizarSkuInput {
  organizacaoId: number;
  skuId: number;
  preco: number;
}

interface AtualizarProdutoCompletoInput {
  organizacaoId: number;
  produtoId: number;
  nome: string;
  descricao: string;
  categoria: string;
  ativo: number;
  preco: number;
  quantidade: number;
}

/**
 * LISTAR
 */
async function listarProdutosService(organizacaoId: number) {
  if (!organizacaoId) {
    throw new Error("Organização inválida");
  }

  return await listarProdutos(organizacaoId);
}

/**
 * BUSCAR
 */
async function buscarProdutoPorIdService(
  organizacaoId: number,
  produtoId: number
) {
  const produto = await buscarProdutoPorId(
    organizacaoId,
    produtoId
  );

  if (!produto) {
    throw new Error("Produto não encontrado");
  }

  return produto;
}

/**
 * CRIAR PRODUTO COMPLETO
 * 🔥 REGRA:
 * - Produto simples → cria 1 SKU automática + estoque
 * - Produto variável → NÃO cria SKU automática
 */
async function criarProdutoCompletoService(
  produtoData: CriarProdutoInput,
  skuData?: Omit<CriarSkuInput, "produtoId">
) {
  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Cria produto
    const produtoId = await criarProduto(
      produtoData.organizacaoId,
      produtoData.nome,
      produtoData.descricao || "",
      produtoData.categoria,
      produtoData.ativo ?? 1,
      produtoData.tipo_produto,
      connection
    );

    let skuId: number | null = null;

    // 2️⃣ Se for produto simples → cria SKU automática
    if (produtoData.tipo_produto === "simples") {

      const precoSeguro =
        isNaN(Number(skuData?.preco)) ? 0 : Number(skuData?.preco);

      const prontaSeguro =
        isNaN(Number(skuData?.prontaEntrega)) ? 1 : Number(skuData?.prontaEntrega);

      const encomendaSeguro =
        isNaN(Number(skuData?.encomenda)) ? 0 : Number(skuData?.encomenda);

      skuId = await criarSku(
        produtoData.organizacaoId,
        produtoId,
        skuData?.skuCodigo || `SKU-${produtoId}`,
        precoSeguro,
        prontaSeguro,
        encomendaSeguro,
        connection
      );

      await criarEstoqueInicial(
        produtoData.organizacaoId,
        skuId,
        connection
      );
    }

    await connection.commit();

    logger.info("[produtosService] Produto criado", {
      organizacaoId: produtoData.organizacaoId,
      produtoId,
      tipo: produtoData.tipo_produto,
    });

    return produtoId;

  } catch (error) {
    await connection.rollback();
    logger.error("[produtosService] Erro ao criar produto", { error });
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * CRIAR SKU
 */
async function criarSkuService({
  organizacaoId,
  produtoId,
  skuCodigo,
  preco,
  prontaEntrega,
  encomenda,
}: CriarSkuInput) {

  if (prontaEntrega === 1 && encomenda === 1) {
    throw new Error(
      "SKU não pode ser pronta_entrega e encomenda ao mesmo tempo"
    );
  }

  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    const [produtoRows]: any = await connection.query(
      `SELECT tipo_produto 
       FROM produtos 
       WHERE id = ? AND organizacao_id = ?`,
      [produtoId, organizacaoId]
    );

    if (!produtoRows.length) {
      throw new Error("Produto não encontrado");
    }

    const tipoProduto = produtoRows[0].tipo_produto;

    if (tipoProduto === "simples") {
      const [skuExistente]: any = await connection.query(
        `SELECT id 
         FROM produtos_skus 
         WHERE produto_id = ? AND organizacao_id = ?`,
        [produtoId, organizacaoId]
      );

      if (skuExistente.length > 0) {
        throw new Error(
          "Produto simples não pode ter mais de uma SKU"
        );
      }
    }

    const skuId = await criarSku(
      organizacaoId,
      produtoId,
      skuCodigo,
      preco,
      prontaEntrega,
      encomenda,
      connection
    );

    await criarEstoqueInicial(
      organizacaoId,
      skuId,
      connection
    );

    await connection.commit();

    logger.info("[produtosService] SKU criada manualmente", {
      organizacaoId,
      produtoId,
      skuId,
    });

    return skuId;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * ATUALIZAR SKU (somente preço)
 */
async function atualizarSkuService({
  organizacaoId,
  skuId,
  preco,
}: AtualizarSkuInput) {

  if (preco < 0) {
    throw new Error("Preço inválido");
  }

  await atualizarSku(
    organizacaoId,
    skuId,
    preco
  );

  logger.info("[produtosService] SKU atualizada", {
    organizacaoId,
    skuId,
  });
}

/**
 * ATUALIZAR PRODUTO COMPLETO (produto simples)
 */
async function atualizarProdutoCompletoService({
  organizacaoId,
  produtoId,
  nome,
  descricao,
  categoria,
  ativo,
  preco,
  quantidade,
}: AtualizarProdutoCompletoInput) {

  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Atualiza produto
    await atualizarProduto(
      organizacaoId,
      produtoId,
      nome,
      descricao,
      categoria,
      ativo,
      connection
    );

    // 2️⃣ Busca SKU do produto simples
    const [skuRows]: any = await connection.query(
      `SELECT id 
       FROM produtos_skus 
       WHERE produto_id = ? 
       AND organizacao_id = ?`,
      [produtoId, organizacaoId]
    );

    if (!skuRows.length) {
      throw new Error("SKU não encontrada");
    }

    const skuId = skuRows[0].id;

    // 3️⃣ Atualiza preço
    await atualizarSku(
      organizacaoId,
      skuId,
      preco,
      connection
    );

    // 4️⃣ Atualiza estoque direto
    await atualizarEstoqueDireto(
      organizacaoId,
      skuId,
      quantidade,
      connection
    );

    await connection.commit();

    logger.info("[produtosService] Produto completo atualizado", {
      organizacaoId,
      produtoId,
    });

  } catch (error) {
    await connection.rollback();
    logger.error("[produtosService] Erro ao atualizar produto completo", { error });
    throw error;
  } finally {
    connection.release();
  }
}

async function gerarSkusVariacoesService({
  organizacaoId,
  produtoId,
  valoresIds,
  preco,
  quantidade,
  prontaEntrega,
  encomenda,
}: any) {

  if (!valoresIds || !Array.isArray(valoresIds) || valoresIds.length === 0) {
    throw new Error("Nenhuma variação informada");
  }

  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    // 🔹 Gerar código SKU baseado nas combinações
    const codigoVariacoes = valoresIds.join("-");
    const skuCodigo = `${produtoId}-${codigoVariacoes}`;

    // 🔹 Criar SKU
    const skuId = await criarSku(
      organizacaoId,
      produtoId,
      skuCodigo,
      preco,
      prontaEntrega,
      encomenda,
      connection
    );

    // 🔹 Criar estoque inicial
    await criarEstoqueInicial(
      organizacaoId,
      skuId,
      connection
    );

    // 🔹 Atualizar quantidade
    await connection.query(
      `
      UPDATE estoque
      SET quantidade = ?
      WHERE organizacao_id = ?
        AND sku_id = ?
      `,
      [quantidade, organizacaoId, skuId]
    );

    // 🔹 Vincular TODAS as variações na mesma SKU
    for (const valorId of valoresIds) {
      await vincularSkuVariacao(
        organizacaoId,
        skuId,
        valorId,
        connection
      );
    }

    await connection.commit();

    logger.info("[produtosService] SKU criada com múltiplas variações", {
      organizacaoId,
      produtoId,
      skuId,
      valoresIds,
    });

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export {
  listarProdutosService,
  buscarProdutoPorIdService,
  criarProdutoCompletoService,
  criarSkuService,
  atualizarSkuService,
  atualizarProdutoCompletoService,
  gerarSkusVariacoesService,
};
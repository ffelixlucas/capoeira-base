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
  vincularSkuVariacao,
  contarPedidosPorSku,
  reativarSku,
  desativarSku
} from "./produtosRepository";

import { deletarArquivoFirebase } from "../../utils/firebaseStorageHelper";

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
  encomenda: number;
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

/* =========================
   LISTAR
========================= */

async function listarProdutosService(
  organizacaoId: number,
  isPublic: boolean = false
) {
  if (!organizacaoId) {
    throw new Error("Organização inválida");
  }

  return await listarProdutos(organizacaoId, isPublic);
}

/* =========================
   BUSCAR
========================= */

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

/* =========================
   CRIAR PRODUTO COMPLETO
========================= */

async function criarProdutoCompletoService(
  produtoData: CriarProdutoInput,
  skuData?: Omit<CriarSkuInput, "produtoId">
) {
  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();



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

/* =========================
   CRIAR SKU
========================= */

async function criarSkuService({
  organizacaoId,
  produtoId,
  skuCodigo,
  preco,
  prontaEntrega,
  encomenda,
}: CriarSkuInput) {

  if (prontaEntrega === 1 && encomenda === 1) {
    throw new Error("SKU não pode ser pronta_entrega e encomenda ao mesmo tempo");
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
        throw new Error("Produto simples não pode ter mais de uma SKU");
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

/* =========================
   ATUALIZAR SKU
========================= */

async function atualizarSkuService({
  organizacaoId,
  skuId,
  preco,
  encomenda,
}: AtualizarSkuInput) {

  if (preco < 0) {
    throw new Error("Preço inválido");
  }

  if (encomenda !== 0 && encomenda !== 1) {
    throw new Error("Valor de encomenda inválido");
  }

  await atualizarSku(
    organizacaoId,
    skuId,
    preco,
    encomenda
  );

  logger.info("[produtosService] SKU atualizada", {
    organizacaoId,
    skuId,
  });
}
/* =========================
   ATUALIZAR PRODUTO COMPLETO
========================= */

async function atualizarProdutoCompletoService({
  organizacaoId,
  produtoId,
  nome,
  descricao,
  categoria,
  ativo,
}: any) {

  await atualizarProduto(
    organizacaoId,
    produtoId,
    nome,
    descricao,
    categoria,
    ativo
  );

  logger.info("[produtosService] Produto atualizado", {
    organizacaoId,
    produtoId,
  });
}
/* =========================
   GERAR SKUS VARIAÇÕES
========================= */

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

    const codigoVariacoes = valoresIds.join("-");
    const skuCodigo = `${produtoId}-${codigoVariacoes}`;

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

    await connection.query(
      `UPDATE estoque
       SET quantidade = ?
       WHERE organizacao_id = ?
       AND sku_id = ?`,
      [quantidade, organizacaoId, skuId]
    );

    for (const valorId of valoresIds) {
      await vincularSkuVariacao(
        organizacaoId,
        skuId,
        valorId,
        connection
      );
    }

    await connection.commit();

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/* =========================
   DELETAR PRODUTO
========================= */

async function deletarProdutoService(
  organizacaoId: number,
  produtoId: number
) {
  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    // 🔒 Verificar se alguma SKU desse produto já teve pedido
    const [skus]: any = await connection.query(
      `SELECT id FROM produtos_skus
   WHERE produto_id = ?
   AND organizacao_id = ?`,
      [produtoId, organizacaoId]
    );

    for (const sku of skus) {
      const totalPedidos = await contarPedidosPorSku(
        organizacaoId,
        sku.id
      );

      if (totalPedidos > 0) {
        throw new Error(
          "Não é possível deletar este produto pois já possui pedidos vinculados"
        );
      }
    }

    const [imagensProduto]: any = await connection.query(
      `SELECT url FROM produto_imagens
       WHERE produto_id = ? AND organizacao_id = ?`,
      [produtoId, organizacaoId]
    );

    const [imagensSku]: any = await connection.query(
      `SELECT si.url
       FROM sku_imagens si
       JOIN produtos_skus ps ON ps.id = si.sku_id
       WHERE ps.produto_id = ?
       AND si.organizacao_id = ?`,
      [produtoId, organizacaoId]
    );

    await connection.query(
      `DELETE FROM produtos
       WHERE id = ? AND organizacao_id = ?`,
      [produtoId, organizacaoId]
    );

    await connection.commit();

    for (const img of imagensProduto) {
      await deletarArquivoFirebase(img.url);
    }

    for (const img of imagensSku) {
      await deletarArquivoFirebase(img.url);
    }

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/* =========================
   IMAGEM PRODUTO
========================= */

async function deletarImagemProdutoService(
  organizacaoId: number,
  imagemId: number
) {
  const [rows]: any = await db.pool.query(
    `SELECT url FROM produto_imagens
     WHERE id = ? AND organizacao_id = ?`,
    [imagemId, organizacaoId]
  );

  if (!rows.length) {
    throw new Error("Imagem não encontrada");
  }

  const url = rows[0].url;

  await db.pool.query(
    `DELETE FROM produto_imagens
     WHERE id = ? AND organizacao_id = ?`,
    [imagemId, organizacaoId]
  );

  await deletarArquivoFirebase(url);
}

async function definirCapaProdutoService(
  organizacaoId: number,
  produtoId: number,
  imagemId: number
) {
  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE produto_imagens
       SET is_capa = 0
       WHERE produto_id = ?
       AND organizacao_id = ?`,
      [produtoId, organizacaoId]
    );

    await connection.query(
      `UPDATE produto_imagens
       SET is_capa = 1
       WHERE id = ?
       AND produto_id = ?
       AND organizacao_id = ?`,
      [imagemId, produtoId, organizacaoId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/* =========================
   IMAGEM SKU
========================= */

async function deletarImagemSkuService(
  organizacaoId: number,
  imagemId: number
) {
  const [rows]: any = await db.pool.query(
    `SELECT url FROM sku_imagens
     WHERE id = ? AND organizacao_id = ?`,
    [imagemId, organizacaoId]
  );

  if (!rows.length) {
    throw new Error("Imagem não encontrada");
  }

  const url = rows[0].url;

  await db.pool.query(
    `DELETE FROM sku_imagens
     WHERE id = ? AND organizacao_id = ?`,
    [imagemId, organizacaoId]
  );

  await deletarArquivoFirebase(url);
}

async function definirCapaSkuService(
  organizacaoId: number,
  skuId: number,
  imagemId: number
) {
  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE sku_imagens
       SET is_capa = 0
       WHERE sku_id = ?
       AND organizacao_id = ?`,
      [skuId, organizacaoId]
    );

    await connection.query(
      `UPDATE sku_imagens
       SET is_capa = 1
       WHERE id = ?
       AND sku_id = ?
       AND organizacao_id = ?`,
      [imagemId, skuId, organizacaoId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/* =========================
   DELETAR SKU
========================= */

async function deletarSkuService(
  organizacaoId: number,
  skuId: number
) {
  const totalPedidos = await contarPedidosPorSku(
    organizacaoId,
    skuId
  );

  // 🚫 Se já teve pedido → bloqueia
  if (totalPedidos > 0) {
    await db.pool.query(
      `UPDATE produtos_skus
       SET ativo = 0
       WHERE id = ?
       AND organizacao_id = ?`,
      [skuId, organizacaoId]
    );
  
    logger.info("[produtosService] SKU desativada (já possuía pedidos)", {
      organizacaoId,
      skuId,
    });
  
    return;
  }

  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    // remove estoque
    await connection.query(
      `DELETE FROM estoque
       WHERE sku_id = ?
       AND organizacao_id = ?`,
      [skuId, organizacaoId]
    );

    // remove imagens
    const [imagens]: any = await connection.query(
      `SELECT url FROM sku_imagens
       WHERE sku_id = ?
       AND organizacao_id = ?`,
      [skuId, organizacaoId]
    );

    await connection.query(
      `DELETE FROM sku_imagens
       WHERE sku_id = ?
       AND organizacao_id = ?`,
      [skuId, organizacaoId]
    );

    // remove vínculos de variação
    await connection.query(
      `DELETE FROM sku_variacoes
       WHERE sku_id = ?
       AND organizacao_id = ?`,
      [skuId, organizacaoId]
    );

    // remove SKU
    await connection.query(
      `DELETE FROM produtos_skus
       WHERE id = ?
       AND organizacao_id = ?`,
      [skuId, organizacaoId]
    );

    await connection.commit();

    // remove arquivos do firebase depois do commit
    for (const img of imagens) {
      await deletarArquivoFirebase(img.url);
    }

    logger.info("[produtosService] SKU deletada fisicamente", {
      organizacaoId,
      skuId,
    });

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/* =========================
   REATIVAR SKU
========================= */

async function reativarSkuService(
  organizacaoId: number,
  skuId: number
) {

  await reativarSku(
    organizacaoId,
    skuId
  );

  logger.info("[produtosService] SKU reativada", {
    organizacaoId,
    skuId,
  });
}
/* =========================
   DESATIVAR SKU
========================= */

async function desativarSkuService(
  organizacaoId: number,
  skuId: number
) {
  await desativarSku(
    organizacaoId,
    skuId
  );

  logger.info("[produtosService] SKU desativada manualmente", {
    organizacaoId,
    skuId,
  });
}

export {
  listarProdutosService,
  buscarProdutoPorIdService,
  criarProdutoCompletoService,
  criarSkuService,
  atualizarSkuService,
  atualizarProdutoCompletoService,
  gerarSkusVariacoesService,
  deletarProdutoService,
  deletarImagemProdutoService,
  definirCapaProdutoService,
  deletarImagemSkuService,
  definirCapaSkuService,
  deletarSkuService,
  reativarSkuService,
  desativarSkuService
};
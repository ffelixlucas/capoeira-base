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

interface AdicionarVariacaoSkuInput {
  organizacaoId: number;
  skuId: number;
  variacaoValorId: number;
}

interface AtualizarVariacoesSkuInput {
  organizacaoId: number;
  skuId: number;
  valoresIds: number[];
}

async function contarReferenciasImagem(url: string) {
  const [[produtoRefs]]: any = await db.pool.query(
    `SELECT COUNT(*) AS total
     FROM produto_imagens
     WHERE url = ?`,
    [url]
  );

  const [[skuRefs]]: any = await db.pool.query(
    `SELECT COUNT(*) AS total
     FROM sku_imagens
     WHERE url = ?`,
    [url]
  );

  return Number(produtoRefs.total || 0) + Number(skuRefs.total || 0);
}

async function deletarArquivoSeSemReferencias(url: string) {
  const totalReferencias = await contarReferenciasImagem(url);

  if (totalReferencias === 0) {
    await deletarArquivoFirebase(url);
  }
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

    const urlsParaVerificar = [
      ...imagensProduto.map((img: any) => img.url),
      ...imagensSku.map((img: any) => img.url),
    ];

    for (const url of [...new Set(urlsParaVerificar)]) {
      await deletarArquivoSeSemReferencias(url);
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

  await deletarArquivoSeSemReferencias(url);
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

  await deletarArquivoSeSemReferencias(url);
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

async function reutilizarImagemProdutoNaSkuService(
  organizacaoId: number,
  skuId: number,
  referencia: { imagemProdutoId?: number; url?: string }
) {
  if (!organizacaoId || !skuId) {
    throw new Error("Parâmetros inválidos");
  }

  const [[sku]]: any = await db.pool.query(
    `SELECT id, produto_id
     FROM produtos_skus
     WHERE id = ?
       AND organizacao_id = ?`,
    [skuId, organizacaoId]
  );

  if (!sku) {
    throw new Error("SKU não encontrada");
  }

  let urlImagem = "";

  if (referencia.imagemProdutoId) {
    const [[imagemProduto]]: any = await db.pool.query(
      `SELECT id, url
       FROM produto_imagens
       WHERE id = ?
         AND produto_id = ?
         AND organizacao_id = ?`,
      [referencia.imagemProdutoId, sku.produto_id, organizacaoId]
    );

    if (!imagemProduto) {
      throw new Error("Imagem do produto não encontrada");
    }

    urlImagem = String(imagemProduto.url);
  } else if (referencia.url) {
    const [[origemProduto]]: any = await db.pool.query(
      `SELECT pi.url
       FROM produto_imagens pi
       WHERE pi.organizacao_id = ?
         AND pi.produto_id = ?
         AND pi.url = ?
       LIMIT 1`,
      [organizacaoId, sku.produto_id, referencia.url]
    );

    const [[origemSku]]: any = await db.pool.query(
      `SELECT si.url
       FROM sku_imagens si
       JOIN produtos_skus ps ON ps.id = si.sku_id
       WHERE si.organizacao_id = ?
         AND ps.organizacao_id = ?
         AND ps.produto_id = ?
         AND si.url = ?
       LIMIT 1`,
      [organizacaoId, organizacaoId, sku.produto_id, referencia.url]
    );

    if (!origemProduto && !origemSku) {
      throw new Error("Imagem não pertence a este produto");
    }

    urlImagem = String(referencia.url);
  } else {
    throw new Error("Informe uma imagem para reaproveitar");
  }

  const [[{ total }]]: any = await db.pool.query(
    `SELECT COUNT(*) AS total
     FROM sku_imagens
     WHERE sku_id = ?
       AND organizacao_id = ?`,
    [skuId, organizacaoId]
  );

  if (Number(total) >= 6) {
    throw new Error("Limite máximo de 6 imagens atingido");
  }

  const [[imagemJaVinculada]]: any = await db.pool.query(
    `SELECT id
     FROM sku_imagens
     WHERE sku_id = ?
       AND organizacao_id = ?
       AND url = ?`,
    [skuId, organizacaoId, urlImagem]
  );

  if (imagemJaVinculada) {
    throw new Error("Essa imagem já está vinculada a esta variação");
  }

  const ordem = Number(total);
  const isCapa = Number(total) === 0 ? 1 : 0;

  await db.pool.query(
    `INSERT INTO sku_imagens
      (organizacao_id, sku_id, url, ordem, is_capa)
     VALUES (?, ?, ?, ?, ?)`,
    [organizacaoId, skuId, urlImagem, ordem, isCapa]
  );
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
    const urlsImagens: string[] = imagens.map((img: any) => String(img.url));

    for (const url of Array.from(new Set<string>(urlsImagens))) {
      await deletarArquivoSeSemReferencias(url);
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

async function adicionarVariacaoSkuService({
  organizacaoId,
  skuId,
  variacaoValorId,
}: AdicionarVariacaoSkuInput) {
  const [[sku]]: any = await db.pool.query(
    `
    SELECT id
    FROM produtos_skus
    WHERE id = ?
      AND organizacao_id = ?
    LIMIT 1
    `,
    [skuId, organizacaoId]
  );

  if (!sku) {
    throw new Error("SKU não encontrada");
  }

  const totalPedidos = await contarPedidosPorSku(organizacaoId, skuId);
  if (totalPedidos > 0) {
    throw new Error("Esta SKU já possui pedidos e não pode ter variações alteradas");
  }

  const [[variacaoValor]]: any = await db.pool.query(
    `
    SELECT vv.id, vv.variacao_tipo_id, vt.nome AS tipo_nome
    FROM variacoes_valores vv
    INNER JOIN variacoes_tipos vt
      ON vt.id = vv.variacao_tipo_id
    WHERE vv.id = ?
      AND vv.organizacao_id = ?
    LIMIT 1
    `,
    [variacaoValorId, organizacaoId]
  );

  if (!variacaoValor) {
    throw new Error("Variação não encontrada");
  }

  const [[tipoJaExiste]]: any = await db.pool.query(
    `
    SELECT sv.sku_id
    FROM sku_variacoes sv
    INNER JOIN variacoes_valores vv
      ON vv.id = sv.variacao_valor_id
    WHERE sv.organizacao_id = ?
      AND sv.sku_id = ?
      AND vv.variacao_tipo_id = ?
    LIMIT 1
    `,
    [organizacaoId, skuId, variacaoValor.variacao_tipo_id]
  );

  if (tipoJaExiste) {
    throw new Error(`Esta SKU já possui variação do tipo "${variacaoValor.tipo_nome}"`);
  }

  const [[valorJaExiste]]: any = await db.pool.query(
    `
    SELECT sku_id
    FROM sku_variacoes
    WHERE organizacao_id = ?
      AND sku_id = ?
      AND variacao_valor_id = ?
    LIMIT 1
    `,
    [organizacaoId, skuId, variacaoValorId]
  );

  if (valorJaExiste) {
    throw new Error("Esta variação já está vinculada à SKU");
  }

  await db.pool.query(
    `
    INSERT INTO sku_variacoes
      (organizacao_id, sku_id, variacao_valor_id)
    VALUES (?, ?, ?)
    `,
    [organizacaoId, skuId, variacaoValorId]
  );

  logger.info("[produtosService] Variação adicionada à SKU", {
    organizacaoId,
    skuId,
    variacaoValorId,
  });
}

async function atualizarVariacoesSkuService({
  organizacaoId,
  skuId,
  valoresIds,
}: AtualizarVariacoesSkuInput) {
  const idsNormalizados = Array.from(
    new Set((valoresIds || []).map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0))
  );

  const [[sku]]: any = await db.pool.query(
    `
    SELECT id
    FROM produtos_skus
    WHERE id = ?
      AND organizacao_id = ?
    LIMIT 1
    `,
    [skuId, organizacaoId]
  );

  if (!sku) {
    throw new Error("SKU não encontrada");
  }

  const totalPedidos = await contarPedidosPorSku(organizacaoId, skuId);
  if (totalPedidos > 0) {
    throw new Error("Esta SKU já possui pedidos e não pode ter variações alteradas");
  }

  let valoresRows: any[] = [];
  if (idsNormalizados.length > 0) {
    const [rows]: any = await db.pool.query(
      `
      SELECT id, variacao_tipo_id
      FROM variacoes_valores
      WHERE organizacao_id = ?
        AND id IN (?)
      `,
      [organizacaoId, idsNormalizados]
    );
    valoresRows = rows || [];

    if (valoresRows.length !== idsNormalizados.length) {
      throw new Error("Uma ou mais variações informadas são inválidas");
    }

    const tipos = valoresRows.map((row) => Number(row.variacao_tipo_id));
    if (new Set(tipos).size !== tipos.length) {
      throw new Error("Não é permitido selecionar dois valores do mesmo tipo");
    }
  }

  const connection = await db.pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `
      DELETE FROM sku_variacoes
      WHERE organizacao_id = ?
        AND sku_id = ?
      `,
      [organizacaoId, skuId]
    );

    for (const valorId of idsNormalizados) {
      await connection.query(
        `
        INSERT INTO sku_variacoes
          (organizacao_id, sku_id, variacao_valor_id)
        VALUES (?, ?, ?)
        `,
        [organizacaoId, skuId, valorId]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  logger.info("[produtosService] Variações da SKU atualizadas", {
    organizacaoId,
    skuId,
    total: idsNormalizados.length,
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
  reutilizarImagemProdutoNaSkuService,
  deletarSkuService,
  reativarSkuService,
  desativarSkuService,
  adicionarVariacaoSkuService,
  atualizarVariacoesSkuService
};

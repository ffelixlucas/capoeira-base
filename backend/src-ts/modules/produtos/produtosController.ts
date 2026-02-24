import { Request, Response } from "express";
import logger from "../../utils/logger";
import {
  listarProdutosService,
  buscarProdutoPorIdService,
  criarSkuService,
  criarProdutoCompletoService,
  atualizarSkuService,
  atualizarProdutoCompletoService,
  gerarSkusVariacoesService,
  definirCapaProdutoService,
  deletarImagemProdutoService,
  definirCapaSkuService,
  deletarImagemSkuService,



} from "./produtosService";
import { atualizarEstoqueDireto } from "./produtosRepository";

import multer from "multer";
import { uploadImagem } from "../../services/imageStorageService";
import db from "../../database/connection";

const upload = multer({ dest: "tmp/" });




/**
 * LISTAR PRODUTOS
 */
async function listarProdutos(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;

    const isPublic = req.query.public === "1";

    const produtos = await listarProdutosService(
      organizacaoId,
      isPublic
    );

    return res.json({
      success: true,
      data: produtos,
    });

  } catch (error: any) {
    logger.error("[produtosController] Erro ao listar produtos", { error });

    return res.status(500).json({
      success: false,
      message: error.message || "Erro interno",
    });
  }
}

/**
 * BUSCAR PRODUTO
 */
async function buscarProdutoPorId(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const produtoId = Number(req.params.id);

    const produto = await buscarProdutoPorIdService(
      organizacaoId,
      produtoId
    );

    return res.json({
      success: true,
      data: produto,
    });

  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Produto não encontrado",
    });
  }
}

/**
 * CRIAR PRODUTO (SIMPLES OU VARIÁVEL)
 */
async function criarProdutoCompleto(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;

    const {
      nome,
      descricao,
      categoria,
      ativo,
      tipo_produto,
      sku_codigo,
      preco,
      pronta_entrega,
      encomenda,
    } = req.body;

    if (!tipo_produto) {
      return res.status(400).json({
        success: false,
        message: "tipo_produto é obrigatório",
      });
    }

    const produtoId = await criarProdutoCompletoService(
      {
        organizacaoId,
        nome,
        descricao,
        categoria,
        ativo,
        tipo_produto,
      },
      tipo_produto === "simples"
        ? {
          organizacaoId,
          skuCodigo: sku_codigo,
          preco: Number(preco),
          prontaEntrega: Number(pronta_entrega),
          encomenda: Number(encomenda),
        }
        : undefined
    );

    return res.status(201).json({
      success: true,
      message:
        tipo_produto === "simples"
          ? "Produto simples criado com SKU inicial"
          : "Produto variável criado com sucesso",
      data: { id: produtoId },
    });

  } catch (error: any) {
    logger.error("[produtosController] Erro ao criar produto", { error });

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar produto",
    });
  }
}

/**
 * CRIAR SKU MANUAL (produto variável)
 */
async function criarSku(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;

    const {
      produto_id,
      sku_codigo,
      preco,
      pronta_entrega,
      encomenda,
    } = req.body;

    const skuId = await criarSkuService({
      organizacaoId,
      produtoId: Number(produto_id),
      skuCodigo: sku_codigo,
      preco,
      prontaEntrega: pronta_entrega,
      encomenda,
    });

    return res.status(201).json({
      success: true,
      message: "SKU criada com sucesso",
      data: { id: skuId },
    });

  } catch (error: any) {
    logger.error("[produtosController] Erro ao criar SKU", { error });

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar SKU",
    });
  }
}

/**
 * ATUALIZAR SKU (somente preço)
 */
async function atualizarSku(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const skuId = Number(req.params.id);
    const { preco } = req.body;

    await atualizarSkuService({
      organizacaoId,
      skuId,
      preco: Number(preco),
    });

    return res.json({
      success: true,
      message: "SKU atualizada com sucesso",
    });

  } catch (error: any) {
    logger.error("[produtosController] Erro ao atualizar SKU", { error });

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao atualizar SKU",
    });
  }
}

/**
 * ATUALIZAR PRODUTO COMPLETO
 * PUT /api/produtos/:id
 */
async function atualizarProdutoCompleto(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const produtoId = Number(req.params.id);

    const {
      nome,
      descricao,
      categoria,
      ativo,
      preco,
      quantidade,
    } = req.body;

    await atualizarProdutoCompletoService({
      organizacaoId,
      produtoId,
      nome,
      descricao,
      categoria,
      ativo,
      preco: Number(preco),
      quantidade: Number(quantidade),
    });

    return res.json({
      success: true,
      message: "Produto atualizado com sucesso",
    });

  } catch (error: any) {
    logger.error("[produtosController] Erro ao atualizar produto", { error });

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao atualizar produto",
    });
  }
}
async function gerarSkusVariacoes(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const produtoId = Number(req.params.produtoId);

    await gerarSkusVariacoesService({
      organizacaoId,
      produtoId,
      ...req.body,
    });

    return res.json({
      success: true,
      message: "SKUs geradas com sucesso",
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
/**
 * ATUALIZAR ESTOQUE DA SKU
 * PUT /api/produtos/sku/:id/estoque
 */
async function atualizarEstoqueSku(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const skuId = Number(req.params.id);
    const { quantidade } = req.body;

    if (isNaN(Number(quantidade))) {
      return res.status(400).json({
        success: false,
        message: "Quantidade inválida",
      });
    }

    await atualizarEstoqueDireto(
      organizacaoId,
      skuId,
      Number(quantidade)
    );

    return res.json({
      success: true,
      message: "Estoque atualizado com sucesso",
    });

  } catch (error: any) {
    logger.error("[produtosController] Erro ao atualizar estoque da SKU", { error });

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao atualizar estoque",
    });
  }
}

const uploadImagemProduto = [
  upload.single("imagem"),
  async (req: any, res: Response) => {
    try {
      const organizacaoId = req.usuario.organizacao_id;
      const produtoId = Number(req.params.id);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Arquivo não enviado",
        });
      }

      // 🔹 Verifica se produto pertence à organização
      const [[produto]]: any = await db.pool.query(
        `
        SELECT id
        FROM produtos
        WHERE id = ?
          AND organizacao_id = ?
        `,
        [produtoId, organizacaoId]
      );

      if (!produto) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado",
        });
      }

      // 🔹 Upload para Firebase via serviço central
      const url = await uploadImagem({
        organizacaoId,
        tipo: "produto",
        entidadeId: produtoId,
        file: req.file,
      });

      // 🔹 Conta quantas imagens já existem
      const [[{ total }]]: any = await db.pool.query(
        `
        SELECT COUNT(*) as total
        FROM produto_imagens
        WHERE produto_id = ?
          AND organizacao_id = ?
        `,
        [produtoId, organizacaoId]
      );

      if (total >= 6) {
        return res.status(400).json({
          success: false,
          message: "Limite máximo de 6 imagens atingido",
        });
      }

      // 🔹 Define ordem automática
      const ordem = total;

      // 🔹 Primeira imagem vira capa
      const isCapa = total === 0 ? 1 : 0;

      await db.pool.query(
        `
        INSERT INTO produto_imagens
          (organizacao_id, produto_id, url, ordem, is_capa)
        VALUES (?, ?, ?, ?, ?)
        `,
        [organizacaoId, produtoId, url, ordem, isCapa]
      );

      return res.status(201).json({
        success: true,
        message: "Imagem enviada com sucesso",
        data: { url },
      });

    } catch (error: any) {
      logger.error("[produtosController] Erro upload imagem produto", { error });

      return res.status(500).json({
        success: false,
        message: "Erro ao enviar imagem",
      });
    }
  },
];

const uploadImagemSku = [
  upload.single("imagem"),
  async (req: any, res: Response) => {
    try {
      const organizacaoId = req.usuario.organizacao_id;
      const skuId = Number(req.params.skuId);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Arquivo não enviado",
        });
      }

      // 🔹 Verifica se SKU pertence à organização
      const [[sku]]: any = await db.pool.query(
        `
        SELECT id
        FROM produtos_skus
        WHERE id = ?
          AND organizacao_id = ?
        `,
        [skuId, organizacaoId]
      );

      if (!sku) {
        return res.status(404).json({
          success: false,
          message: "SKU não encontrada",
        });
      }

      // 🔹 Upload Firebase
      const url = await uploadImagem({
        organizacaoId,
        tipo: "sku",
        entidadeId: skuId,
        file: req.file,
      });

      // 🔹 Conta imagens existentes
      const [[{ total }]]: any = await db.pool.query(
        `
        SELECT COUNT(*) as total
        FROM sku_imagens
        WHERE sku_id = ?
          AND organizacao_id = ?
        `,
        [skuId, organizacaoId]
      );

      if (total >= 6) {
        return res.status(400).json({
          success: false,
          message: "Limite máximo de 6 imagens atingido",
        });
      }

      const ordem = total;
      const isCapa = total === 0 ? 1 : 0;

      await db.pool.query(
        `
        INSERT INTO sku_imagens
          (organizacao_id, sku_id, url, ordem, is_capa)
        VALUES (?, ?, ?, ?, ?)
        `,
        [organizacaoId, skuId, url, ordem, isCapa]
      );

      return res.status(201).json({
        success: true,
        message: "Imagem da SKU enviada com sucesso",
        data: { url },
      });

    } catch (error: any) {
      logger.error("[produtosController] Erro upload imagem SKU", { error });

      return res.status(500).json({
        success: false,
        message: "Erro ao enviar imagem da SKU",
      });
    }
  },
];

async function definirCapaProduto(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const produtoId = Number(req.params.produtoId);
    const imagemId = Number(req.params.imagemId);

    await definirCapaProdutoService(
      organizacaoId,
      produtoId,
      imagemId
    );

    return res.json({
      success: true,
      message: "Imagem definida como capa",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function removerImagemProduto(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const imagemId = Number(req.params.imagemId);

    await deletarImagemProdutoService(
      organizacaoId,
      imagemId
    );

    return res.json({
      success: true,
      message: "Imagem removida",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}



async function definirCapaSku(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const skuId = Number(req.params.skuId);
    const imagemId = Number(req.params.imagemId);

    await definirCapaSkuService(
      organizacaoId,
      skuId,
      imagemId
    );

    return res.json({
      success: true,
      message: "Imagem da SKU definida como capa",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function removerImagemSku(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const imagemId = Number(req.params.imagemId);

    await deletarImagemSkuService(
      organizacaoId,
      imagemId
    );

    return res.json({
      success: true,
      message: "Imagem da SKU removida",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


export {
  listarProdutos,
  buscarProdutoPorId,
  criarProdutoCompleto,
  criarSku,
  atualizarSku,
  atualizarProdutoCompleto,
  gerarSkusVariacoes,
  atualizarEstoqueSku,
  uploadImagemProduto,
  definirCapaProduto,
  removerImagemProduto,
  definirCapaSku,
  removerImagemSku,
  uploadImagemSku,
};



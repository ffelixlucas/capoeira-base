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
} from "./produtosService";
import { atualizarEstoqueDireto } from "./produtosRepository";
/**
 * LISTAR PRODUTOS
 */
async function listarProdutos(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;

    const produtos = await listarProdutosService(organizacaoId);

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

export {
  listarProdutos,
  buscarProdutoPorId,
  criarProdutoCompleto,
  criarSku,
  atualizarSku,
  atualizarProdutoCompleto,
  gerarSkusVariacoes,
  atualizarEstoqueSku,

};
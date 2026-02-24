import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import {
  listarProdutos,
  buscarProdutoPorId,
  criarProdutoCompleto,
  criarSku,
  atualizarSku,
  atualizarProdutoCompleto,
  gerarSkusVariacoes,
  atualizarEstoqueSku
} from "./produtosController";

const router = Router();

/**
 * LISTAR PRODUTOS
 * GET /api/produtos
 */
router.get("/", verifyToken, listarProdutos);

/**
 * BUSCAR PRODUTO
 * GET /api/produtos/:id
 */
router.get("/:id", verifyToken, buscarProdutoPorId);

/**
 * CRIAR PRODUTO (simples ou variável)
 * POST /api/produtos
 */
router.post("/", verifyToken, criarProdutoCompleto);

/**
 * CRIAR SKU MANUAL (produto variável)
 * POST /api/produtos/sku
 */
router.post("/sku", verifyToken, criarSku);

router.post(
  "/:produtoId/gerar-skus",
  verifyToken,
  gerarSkusVariacoes
);

/**
 * ATUALIZAR SKU (somente preço)
 * PUT /api/produtos/sku/:id
 */
router.put("/sku/:id", verifyToken, atualizarSku);

router.put("/sku/:id/estoque", verifyToken, atualizarEstoqueSku);

/**
 * ATUALIZAR PRODUTO COMPLETO
 * PUT /api/produtos/:id
 */
router.put("/:id", verifyToken, atualizarProdutoCompleto);

export default router;
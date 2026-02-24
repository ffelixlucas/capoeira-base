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
  atualizarEstoqueSku,
  uploadImagemProduto,
  definirCapaProduto,
  removerImagemProduto,
  definirCapaSku,
  removerImagemSku,
  uploadImagemSku,

} from "./produtosController";

const router = Router();

// 1️⃣ SKU 
router.post("/sku", verifyToken, criarSku);
router.put("/sku/:id", verifyToken, atualizarSku);
router.put("/sku/:id/estoque", verifyToken, atualizarEstoqueSku);
router.put("/sku/:skuId/imagens/:imagemId/capa", verifyToken, definirCapaSku);
router.delete("/sku/imagens/:imagemId", verifyToken, removerImagemSku);

// 2️⃣ Produto 
router.post("/:produtoId/gerar-skus", verifyToken, gerarSkusVariacoes);
router.post("/:id/imagens", verifyToken, uploadImagemProduto);
router.post("/sku/:skuId/imagens", verifyToken, uploadImagemSku);
router.put("/:produtoId/imagens/:imagemId/capa", verifyToken, definirCapaProduto);
router.delete("/imagens/:imagemId", verifyToken, removerImagemProduto);
router.put("/:id", verifyToken, atualizarProdutoCompleto);

// 3️⃣ Genéricas 
router.get("/", verifyToken, listarProdutos);
router.get("/:id", verifyToken, buscarProdutoPorId);
router.post("/", verifyToken, criarProdutoCompleto);

export default router;
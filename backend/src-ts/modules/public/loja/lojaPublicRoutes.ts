import { Router } from "express";
import lojaPublicController from "./lojaPublicController";

const router = Router();

/**
 * Rota pública da loja
 * Lista SKUs disponíveis para venda
 */
router.get(
  "/:slug/skus",
  lojaPublicController.listarSkus
);
router.get(
  "/:slug/sku/:id",
  lojaPublicController.buscarSkuPorId
);


export default router;

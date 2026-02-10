import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import { buscarPedido, marcarPedidoPronto } from "./pedidosController";

const router = Router();

// Detalhe de um pedido
router.get("/:pedidoId", verifyToken, buscarPedido);

// Marcar pedido como pronto para retirada
router.patch("/:pedidoId/pronto-retirada", verifyToken, marcarPedidoPronto);

export default router;

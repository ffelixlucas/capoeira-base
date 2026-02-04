import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import { buscarPedido } from "./pedidosController";

const router = Router();

// Detalhe de um pedido
router.get("/:pedidoId", verifyToken, buscarPedido);

export default router;

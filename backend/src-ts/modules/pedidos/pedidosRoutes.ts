import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import { buscarPedido, marcarPedidoPronto, listarPedidos, cancelarPedido, estatisticasPedidos, marcarPedidoEntregue, estornarPedido } from "./pedidosController";

const router = Router();
// Estatísticas de pedidos
router.get("/estatisticas", verifyToken, estatisticasPedidos);


// Detalhe de um pedido
router.get("/:pedidoId", verifyToken, buscarPedido);

// Listar pedidos de uma organização
router.get("/", verifyToken, listarPedidos);

// Marcar pedido como pronto para retirada
router.patch("/:pedidoId/pronto-retirada", verifyToken, marcarPedidoPronto);

router.patch("/:pedidoId/entregue", verifyToken, marcarPedidoEntregue);

// Cancelar pedido
router.patch("/:pedidoId/cancelar", verifyToken, cancelarPedido);

router.patch("/:pedidoId/estornar", verifyToken, estornarPedido);


export default router;

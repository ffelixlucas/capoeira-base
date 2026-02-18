import { Router, Request, Response, NextFunction } from "express";
import {
  finalizarPedidoPublic,
  buscarPedidoPublic,
} from "./pedidosPublicController";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ ok: true, modulo: "pedidos-public" });
});

router.get(
  "/:slug/:pedidoId",
  (req: Request, res: Response) =>
    buscarPedidoPublic(req, res)
);

// Finalizar pedido
router.post(
  "/:slug/finalizar",
  (req: Request, res: Response, next: NextFunction) => {
    req.body.slug = req.params.slug;
    next();
  },
  (req: Request, res: Response) =>
    finalizarPedidoPublic(req, res)
);

export default router;

import { Router } from "express";
import { getPorTipo, post, del } from "./notificacaoDestinosController";
import verifyToken from "../../middlewares/verifyToken";
import checkRole from "../../middlewares/checkRole";

const router = Router();

// 🔐 Multi-Organização
// Apenas administradores podem gerenciar destinos de notificação

router.get(
  "/:grupoId/:tipo",
  verifyToken,
  checkRole(["admin"]),
  getPorTipo
);

router.post(
  "/",
  verifyToken,
  checkRole(["admin"]),
  post
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  del
);

export default router;

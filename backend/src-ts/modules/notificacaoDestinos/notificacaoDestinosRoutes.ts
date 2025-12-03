import { Router } from "express";
import { getPorTipo, post, del } from "./notificacaoDestinosController";
import verifyToken from "../../middlewares/verifyToken";
import checkRole from "../../middlewares/checkRole";

const router = Router();

// 🔐 Multi-Organização
// Apenas administradores podem gerenciar destinos de notificação

// Listar por tipo
// GET /api/notificacoes/matricula
router.get(
  "/:tipo",
  verifyToken,
  checkRole(["admin"]),
  getPorTipo
);

// Criar nova notificação
// POST /api/notificacoes
router.post(
  "/",
  verifyToken,
  checkRole(["admin"]),
  post
);

// Remover notificação
// DELETE /api/notificacoes/:id
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  del
);

export default router;

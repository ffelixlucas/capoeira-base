import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import checkRole from "../../middlewares/checkRole";
import {
  atividadesRecentes,
  listarPorTurmaEData,
  relatorioPorPeriodo,
  resumoDia,
  salvarBatch,
  atualizarUma,
} from "./presencasController";

const router = Router();

// GET /api/presencas?turma_id=1&data=2025-08-09
router.get(
  "/",
  verifyToken,
  checkRole(["admin", "instrutor"]),
  listarPorTurmaEData
);

// GET /api/presencas/relatorio?inicio&fim
router.get(
  "/relatorio",
  verifyToken,
  checkRole(["admin", "instrutor"]),
  relatorioPorPeriodo
);

// GET /api/presencas/resumo-dia?data=2026-03-05
router.get(
  "/resumo-dia",
  verifyToken,
  checkRole(["admin", "instrutor"]),
  resumoDia
);

// GET /api/presencas/atividades-recentes?limit=20
router.get(
  "/atividades-recentes",
  verifyToken,
  checkRole(["admin", "instrutor"]),
  atividadesRecentes
);

// POST /api/presencas/batch
router.post(
  "/batch",
  verifyToken,
  checkRole(["admin", "instrutor"]),
  salvarBatch
);

// PUT /api/presencas/:id
router.put(
  "/:id",
  verifyToken,
  checkRole(["admin", "instrutor"]),
  atualizarUma
);

export default router;

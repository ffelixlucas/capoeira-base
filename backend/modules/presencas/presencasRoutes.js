const express = require("express");
const router = express.Router();
const controller = require("./presencasController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

// Listar presenças do dia por turma
// GET /api/presencas?turma_id=1&data=2025-08-09
router.get("/", verifyToken, checkRole(["admin", "instrutor"]), controller.listarPorTurmaEData);

// Relatório por período (agregado por turma)
// GET /api/presencas/relatorio?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
router.get("/relatorio", verifyToken, checkRole(["admin", "instrutor"]), controller.relatorioPorPeriodo);

// Salvar em lote (upsert)
// POST /api/presencas/batch
router.post("/batch", verifyToken, checkRole(["admin", "instrutor"]), controller.salvarBatch);

// Atualização pontual
// PUT /api/presencas/:id
router.put("/:id", verifyToken, checkRole(["admin", "instrutor"]), controller.atualizarUma);

module.exports = router;

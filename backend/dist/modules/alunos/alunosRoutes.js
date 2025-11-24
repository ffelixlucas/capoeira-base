// alunosRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("./alunosController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");
// Todas as rotas protegidas por autenticação e RBAC
router.use(verifyToken);
router.get("/", checkRole(["admin", "instrutor"]), controller.listar);
router.get("/pendentes/count", checkRole(["admin"]), controller.contarPendentes);
router.get("/pendentes", checkRole(["admin"]), controller.listarPendentes);
router.get("/:id", checkRole(["admin", "instrutor"]), controller.buscar);
router.get("/:id/metricas", checkRole(["admin", "instrutor"]), controller.metricasAluno);
router.post("/", checkRole(["admin", "instrutor"]), controller.cadastrar);
router.put("/:id", checkRole(["admin", "instrutor"]), controller.editar);
router.delete("/:id", checkRole(["admin"]), controller.excluir);
router.put("/:id/trocar-turma", checkRole(["admin", "instrutor"]), controller.trocarTurma);
router.patch("/:id/status", checkRole(["admin"]), controller.atualizarStatus);
module.exports = router;

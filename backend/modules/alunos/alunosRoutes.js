const express = require("express");
const router = express.Router();
const controller = require("./alunosController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

// Todas as rotas protegidas por autenticação
router.use(verifyToken);

// 🔹 Listar alunos (admin / instrutor)
router.get("/", checkRole(["admin", "instrutor"]), controller.listar);

// 🔹 Pendentes (apenas admin)
router.get(
  "/pendentes/count",
  checkRole(["admin"]),
  controller.contarPendentes
);
router.get("/pendentes", checkRole(["admin"]), controller.listarPendentes);

// 🔹 Buscar aluno por ID (admin / instrutor)
router.get("/:id", checkRole(["admin", "instrutor"]), controller.buscar);

// 🔹 Métricas (admin / instrutor)
router.get(
  "/:id/metricas",
  checkRole(["admin", "instrutor"]),
  controller.metricasAluno
);

// 🔹 Editar aluno (admin / instrutor)
router.put("/:id", checkRole(["admin", "instrutor"]), controller.editar);

// 🔹 Excluir aluno (apenas admin)
router.delete("/:id", checkRole(["admin"]), controller.excluir);

// 🔹 Trocar turma (admin / instrutor)
router.put(
  "/:id/trocar-turma",
  checkRole(["admin", "instrutor"]),
  controller.trocarTurma
);

// 🔹 Atualizar status (apenas admin)
router.patch("/:id/status", checkRole(["admin"]), controller.atualizarStatus);

module.exports = router;

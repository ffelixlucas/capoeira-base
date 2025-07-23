// alunosRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("./alunosController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

// Todas as rotas protegidas por autenticação e RBAC
router.use(verifyToken);

router.get("/", checkRole(["admin", "instrutor"]), controller.listar);
router.get("/:id", checkRole(["admin", "instrutor"]), controller.buscar);
router.post("/", checkRole(["admin", "instrutor"]), controller.cadastrar);
router.put("/:id", checkRole(["admin", "instrutor"]), controller.editar);
router.delete("/:id", checkRole(["admin"]), controller.excluir);
router.put("/:id/trocar-turma", checkRole(["admin", "instrutor"]), controller.trocarTurma);

module.exports = router;

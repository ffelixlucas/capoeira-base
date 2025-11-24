// modules/graduacoes/graduacoesRoutes.js
const express = require("express");
const router = express.Router();
const graduacoesController = require("./graduacoesController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");
// Todas as rotas são exclusivas para ADMIN
router.use(verifyToken, checkRole(["admin"]));
router.get("/", graduacoesController.listarTodas);
router.get("/categoria/:categoriaId", graduacoesController.listarPorCategoria);
router.get("/:id", graduacoesController.buscarPorId);
router.post("/", graduacoesController.criar);
router.put("/:id", graduacoesController.atualizar);
router.delete("/:id", graduacoesController.remover);
module.exports = router;

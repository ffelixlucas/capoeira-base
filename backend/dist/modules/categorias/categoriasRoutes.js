// modules/categorias/categoriasRoutes.js
const express = require("express");
const router = express.Router();
const categoriasController = require("./categoriasController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");
// Todas as rotas — exclusivo ADMIN
router.use(verifyToken, checkRole(["admin"]));
router.get("/", categoriasController.listarTodas);
router.get("/por-idade/:idade", categoriasController.buscarPorIdade);
router.get("/:id", categoriasController.buscarPorId);
router.post("/", categoriasController.criar);
router.put("/:id", categoriasController.atualizar);
router.delete("/:id", categoriasController.remover);
module.exports = router;

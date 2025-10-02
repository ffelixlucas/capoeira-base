// modules/graduacoes/graduacoesRoutes.js
const express = require("express");
const router = express.Router();
const graduacoesController = require("./graduacoesController");

// GET /graduacoes → todas
router.get("/", graduacoesController.getTodas);

// GET /graduacoes/categoria/:categoriaId → filtradas por categoria_id
router.get("/categoria/:categoriaId", graduacoesController.getPorCategoria);

module.exports = router;

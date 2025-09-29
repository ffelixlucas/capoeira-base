// modules/graduacoes/graduacoesRoutes.js
const express = require("express");
const router = express.Router();
const graduacoesController = require("./graduacoesController.js");

// GET /graduacoes
router.get("/", graduacoesController.getTodas);

// GET /graduacoes/:categoria
router.get("/:categoria", graduacoesController.getPorCategoria);

module.exports = router;

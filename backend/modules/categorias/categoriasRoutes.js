// modules/categorias/categoriasRoutes.js
const express = require("express");
const router = express.Router();
const categoriasController = require("./categoriasController");

// GET /categorias → lista todas
router.get("/", categoriasController.getTodas);
// GET /categorias/por-idade/:idade → retorna categoria compatível
router.get("/por-idade/:idade", categoriasController.getPorIdade);

module.exports = router;

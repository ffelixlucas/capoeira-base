// modules/categorias/categoriasRoutes.js
const express = require("express");
const router = express.Router();
const categoriasController = require("./categoriasController");

// GET /categorias → lista todas
router.get("/", categoriasController.getTodas);

module.exports = router;

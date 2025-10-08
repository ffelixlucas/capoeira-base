// modules/matricula/matriculaRoutes.js
const express = require("express");
const router = express.Router();
const matriculaController = require("./matriculaController");

// 🔹 Rota interna/admin — criar aluno real após aprovação
router.post("/matricula", matriculaController.criarMatricula);

module.exports = router;

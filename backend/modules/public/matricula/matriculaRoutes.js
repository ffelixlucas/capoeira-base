// modules/public/matricula/matriculaRoutes.js
// 🎯 Routes da Matrícula Pública
// Define as rotas públicas relacionadas à matrícula.

const express = require("express");
const router = express.Router();
const matriculaController = require("./matriculaController");

// POST /public/matricula
router.post("/matricula", matriculaController.criarMatricula);
// GET /public/matricula/grupo/:organizacaoId
router.get("/matricula/grupo/:organizacaoId", matriculaController.getGrupo);


module.exports = router;

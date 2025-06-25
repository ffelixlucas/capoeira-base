// backend/modules/equipe/equipeRoutes.js

const express = require("express");
const router = express.Router();
const equipeController = require("./equipeController");

router.get("/", equipeController.getEquipe);              // Listar todos
router.post("/", equipeController.criarEquipe);           // Criar novo membro
router.put("/:id", equipeController.atualizarEquipe);     // Editar membro
router.delete("/:id", equipeController.removerEquipe);    // Remover membro

module.exports = router;

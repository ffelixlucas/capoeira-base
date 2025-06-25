const express = require("express");
const router = express.Router();
const equipeController = require("./equipeController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

// Listar equipe — pode liberar para admin e instrutor, se quiser
router.get("/", verifyToken, checkRole(["admin", "instrutor"]), equipeController.getEquipe);

// Criar, atualizar e remover membros — somente admin
router.post("/", verifyToken, checkRole(["admin"]), equipeController.criarEquipe);
router.put("/:id", verifyToken, checkRole(["admin"]), equipeController.atualizarEquipe);
router.delete("/:id", verifyToken, checkRole(["admin"]), equipeController.removerEquipe);

module.exports = router;

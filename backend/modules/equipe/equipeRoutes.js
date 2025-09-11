const express = require("express");
const router = express.Router();
const equipeController = require("./equipeController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

// Listar equipe — pode liberar para admin e instrutor, se quiser
router.get("/", verifyToken, checkRole(["admin", "instrutor"]), equipeController.getEquipe);
// Obter perfil do próprio usuário
router.get("/me", verifyToken, equipeController.getPerfil);


// Atualizar perfil do próprio usuário (rota segura)
router.put("/me", verifyToken, equipeController.atualizarPerfil);
// Alterar senha do próprio usuário (rota segura)
router.put("/me/senha", verifyToken, equipeController.alterarSenha);


// Criar, atualizar e remover membros — somente admin
router.post("/", verifyToken, checkRole(["admin"]), equipeController.criarEquipe);
router.put("/:id", verifyToken, checkRole(["admin"]), equipeController.atualizarEquipe);
router.delete("/:id", verifyToken, checkRole(["admin"]), equipeController.removerEquipe);



module.exports = router;

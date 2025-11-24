const express = require("express");
const router = express.Router();
const equipeController = require("./equipeController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");
/* -------------------------------------------------------------------------- */
/* 🔒 Rotas protegidas - módulo Equipe                                        */
/* -------------------------------------------------------------------------- */
/**
 * 📋 Listar equipe
 * Permissão: admin e instrutor
 */
router.get("/", verifyToken, checkRole(["admin", "instrutor"]), equipeController.getEquipe);
/**
 * 👤 Perfil do usuário logado
 * - GET: visualizar perfil
 * - PUT: atualizar dados pessoais
 * - PUT /senha: alterar senha
 */
router.get("/me", verifyToken, equipeController.getPerfil);
router.put("/me", verifyToken, equipeController.atualizarPerfil);
router.put("/me/senha", verifyToken, equipeController.alterarSenha);
/**
 * 🧱 Gerenciamento de membros da equipe
 * Somente administradores podem criar, editar ou excluir membros.
 */
router.post("/", verifyToken, checkRole(["admin"]), equipeController.criarEquipe);
router.put("/:id", verifyToken, checkRole(["admin"]), equipeController.atualizarEquipe);
router.delete("/:id", verifyToken, checkRole(["admin"]), equipeController.removerEquipe);
/* -------------------------------------------------------------------------- */
module.exports = router;

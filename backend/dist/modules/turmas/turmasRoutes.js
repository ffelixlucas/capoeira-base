// modules/turmas/turmasRoutes.js
const express = require("express");
const router = express.Router();
const turmasController = require("./turmasController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");
// Todas as rotas exigem token
router.use(verifyToken);
/* -------------------------------------------------------------------------- */
/* 🔍 Listagem                                                                 */
/* -------------------------------------------------------------------------- */
router.get("/", checkRole(["admin", "instrutor"]), turmasController.listarTurmasAtivas);
router.get("/minhas", checkRole(["admin", "instrutor"]), turmasController.listarMinhasTurmas);
/* -------------------------------------------------------------------------- */
/* 🎯 Buscar turma pela idade (USADO NO MODAL DE PENDENTES)                    */
/* -------------------------------------------------------------------------- */
router.get("/turma-por-idade/:idade", checkRole(["admin", "instrutor"]), turmasController.buscarTurmaPorIdade);
/* -------------------------------------------------------------------------- */
/* 🧩 Operações de turma                                                        */
/* -------------------------------------------------------------------------- */
router.get("/:id/vinculos", checkRole(["admin", "instrutor"]), turmasController.verificarVinculos);
router.post("/", checkRole(["admin"]), turmasController.criarTurma);
router.put("/:id", checkRole(["admin"]), turmasController.atualizarTurma);
router.delete("/:id", checkRole(["admin"]), turmasController.excluirTurma);
router.post("/:id/encerrar", checkRole(["admin"]), turmasController.encerrarTurma);
module.exports = router;

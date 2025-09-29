const express = require("express");
const router = express.Router();
const ctrl = require("./notificacaoDestinosController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

// Somente ADMIN pode gerenciar notificações
// Somente ADMIN pode gerenciar notificações
router.get("/:grupoId/:tipo", verifyToken, checkRole(["admin"]), ctrl.getPorTipo);
router.post("/", verifyToken, checkRole(["admin"]), ctrl.post);
router.delete("/:id", verifyToken, checkRole(["admin"]), ctrl.del);


module.exports = router;

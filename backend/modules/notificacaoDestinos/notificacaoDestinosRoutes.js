// modules/notificacaoDestinos/notificacaoDestinosRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("./notificacaoDestinosController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

// ✅ Multi-Organização: o organizacao_id vem do token JWT
// Apenas administradores podem gerenciar os destinos de notificação
router.get(
  "/:grupoId/:tipo",
  verifyToken,
  checkRole(["admin"]),
  ctrl.getPorTipo
);

router.post(
  "/",
  verifyToken,
  checkRole(["admin"]),
  ctrl.post
);

router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  ctrl.del
);

module.exports = router;

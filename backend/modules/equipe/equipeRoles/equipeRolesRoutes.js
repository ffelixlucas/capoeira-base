// backend/modules/equipeRoles/equipeRolesRoutes.js
const express = require("express");
const router = express.Router();
const equipeRolesController = require("./equipeRolesController");
const verifyToken = require("../../../middlewares/verifyToken");
const checkRole = require("../../../middlewares/checkRole");

/* -------------------------------------------------------------------------- */
/* 🔐 Todas as rotas exigem autenticação e role admin                         */
/* -------------------------------------------------------------------------- */

// Listar papéis de um membro
router.get(
  "/:id/roles",
  verifyToken,
  checkRole(["admin"]),
  equipeRolesController.listarRoles
);

// Atribuir papel a um membro
router.post(
  "/:id/roles",
  verifyToken,
  checkRole(["admin"]),
  equipeRolesController.adicionarRole
);

// Remover papel específico de um membro
router.delete(
  "/:id/roles/:roleId",
  verifyToken,
  checkRole(["admin"]),
  equipeRolesController.removerRole
);

// Remover TODOS os papéis de um membro
router.delete(
  "/:id/roles",
  verifyToken,
  checkRole(["admin"]),
  equipeRolesController.removerTodosOsRoles
);

/* -------------------------------------------------------------------------- */
module.exports = router;

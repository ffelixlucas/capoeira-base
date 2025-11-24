// backend/modules/agenda/agendaRoutes.js
const express = require("express");
const router = express.Router();

const agendaController = require("./agendaController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

/* -------------------------------------------------------------------------- */
/* 🌍 Rotas Públicas                                                         */
/* -------------------------------------------------------------------------- */
// Lista todos os eventos públicos
router.get("/", verifyToken, agendaController.listarEventos);

/* -------------------------------------------------------------------------- */
/* 🔐 Rotas Protegidas - Requer Autenticação JWT                              */
/* -------------------------------------------------------------------------- */
// Criar evento com upload de imagem (Firebase)
router.post(
  "/upload-imagem",
  verifyToken,
  checkRole(["admin", "instrutor", "midia"]),
  upload.single("imagem"),
  agendaController.criarEventoComImagem
);

// Criar evento
router.post(
  "/",
  verifyToken,
  checkRole(["admin", "instrutor", "midia"]),
  agendaController.criarEvento
);

// Atualizar evento
router.put(
  "/:id",
  verifyToken,
  checkRole(["admin", "instrutor", "midia"]),
  agendaController.atualizarEvento
);

// Excluir evento
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin", "instrutor", "midia"]),
  agendaController.excluirEvento
);

// Atualizar status (ativo, concluído, cancelado)
router.put(
  "/:id/status",
  verifyToken,
  checkRole(["admin"]),
  agendaController.atualizarStatus
);

// Arquivar evento (marca como concluído e limpa imagem)
router.put(
  "/:id/arquivar",
  verifyToken,
  checkRole(["admin", "instrutor", "midia"]),
  agendaController.arquivarEvento
);

/* -------------------------------------------------------------------------- */
module.exports = router;

const express = require("express");
const router = express.Router();
const publicAgendaController = require("./publicAgendaController");

// 🔹 Lista todos os eventos públicos (landing)
router.get("/", publicAgendaController.listarEventosPublicos);

// 🔹 Retorna um evento específico (formulário de inscrição)
router.get("/:id", publicAgendaController.buscarEventoPublicoPorId);

module.exports = router;

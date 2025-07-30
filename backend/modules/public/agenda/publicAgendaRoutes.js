const express = require("express");
const router = express.Router();
const publicAgendaController = require("./publicAgendaController");

// 🔹 Rota pública para listar eventos abertos ao público
router.get("/", publicAgendaController.listarEventosPublicos);

// 🔹 Rota pública para buscar um evento específico
router.get("/:id", publicAgendaController.buscarEventoPublicoPorId);

module.exports = router;

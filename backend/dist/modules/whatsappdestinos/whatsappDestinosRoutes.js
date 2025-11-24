const express = require("express");
const router = express.Router();
const controller = require("./whatsappDestinosController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");
// Apenas admin pode listar e atualizar os destinos
router.get("/", verifyToken, checkRole(["admin"]), controller.listar);
router.put("/:horarioId", verifyToken, checkRole(["admin"]), controller.atualizar);
module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("./whatsappDestinosController");

router.get("/", controller.listar);
router.put("/:horarioId", controller.atualizar);

module.exports = router;

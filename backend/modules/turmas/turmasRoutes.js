// backend/modules/turmas/turmasRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("./turmasController.js");

router.get("/", controller.listarTurmasAtivas);

module.exports = router;

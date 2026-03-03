const express = require("express");
const router = express.Router();
const publicGaleriaController = require("./publicGaleriaController");

router.get("/:slug", publicGaleriaController.listar);

module.exports = router;

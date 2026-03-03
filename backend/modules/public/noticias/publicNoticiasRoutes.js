const express = require("express");
const router = express.Router();
const publicNoticiasController = require("./publicNoticiasController");

router.get("/:slug", publicNoticiasController.listar);

module.exports = router;

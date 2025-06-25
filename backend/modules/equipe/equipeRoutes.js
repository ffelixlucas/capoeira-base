const express = require("express");
const router = express.Router();
const equipeController = require("./equipeController");
const verifyToken = require("../../middlewares/verifyToken");

router.get("/", verifyToken, equipeController.getEquipe);     
router.post("/", verifyToken, equipeController.criarEquipe);
router.put("/:id", verifyToken, equipeController.atualizarEquipe);
router.delete("/:id", verifyToken, equipeController.removerEquipe);

module.exports = router;

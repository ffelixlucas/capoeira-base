const express = require("express");
const router = express.Router();
const controller = require("./turmasController");

const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

router.get("/", verifyToken, controller.listarTurmasAtivas);
router.post("/", verifyToken, checkRole(["admin"]), controller.criarTurma);
router.put("/:id", verifyToken, checkRole(["admin"]), controller.atualizarTurma);
router.delete("/:id", verifyToken, checkRole(["admin"]), controller.excluirTurma);

module.exports = router;

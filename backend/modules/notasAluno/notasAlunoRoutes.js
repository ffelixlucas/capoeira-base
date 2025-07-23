// backend/modules/notasAluno/notasAlunoRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("./notasAlunoController");
const verifyToken = require("../../middlewares/verifyToken");

router.use(verifyToken);

router.get("/:alunoId", controller.listarPorAluno);
router.post("/:alunoId", controller.criar);
router.delete("/:id", controller.excluir);

module.exports = router;

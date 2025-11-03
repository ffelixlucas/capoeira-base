const express = require("express");
const router = express.Router();
const matriculaController = require("./matriculaController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");

router.post(
  "/matricula",
  verifyToken,
  checkRole(["admin"]),
  matriculaController.criarMatricula
);

module.exports = router;

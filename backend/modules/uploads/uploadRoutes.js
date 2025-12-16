const express = require("express");
const router = express.Router();
const uploadController = require("./uploadController");
const optionalAuth = require("../../middlewares/optionalAuth");
const verifyToken = require("../../middlewares/verifyToken");


// 🔹 Permite upload público OU autenticado
router.post("/foto", optionalAuth, uploadController.uploadFoto);
// uploadRoutes.js
router.post("/foto/pre-matricula", uploadController.uploadFotoPreMatricula);

router.post("/foto/aluno",verifyToken, optionalAuth, uploadController.uploadFotoAluno);



module.exports = router;

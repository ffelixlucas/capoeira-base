const express = require("express");
const router = express.Router();
const uploadController = require("./uploadController");
const optionalAuth = require("../../middlewares/optionalAuth");

// 🔹 Permite upload público OU autenticado
router.post("/foto", optionalAuth, uploadController.uploadFoto);
// uploadRoutes.js
router.post("/foto/pre-matricula", uploadController.uploadFotoPreMatricula);


module.exports = router;

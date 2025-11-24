const express = require("express");
const router = express.Router();
const organizacaoPublicController = require("./organizacaoPublicController");
// 🔹 Endpoint público usado em formulários (pré-matrícula, inscrições, etc.)
router.get("/:slug", organizacaoPublicController.getOrganizacaoPublica);
module.exports = router;

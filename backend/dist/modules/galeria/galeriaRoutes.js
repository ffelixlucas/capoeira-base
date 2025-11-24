const express = require("express");
const multer = require("multer");
const galeriaController = require("./galeriaController");
const verifyToken = require("../../middlewares/verifyToken");
const checkRole = require("../../middlewares/checkRole");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
// ✅ Rota pública
router.get("/", galeriaController.listarImagens);
// ✅ Upload de imagem
router.post("/upload", verifyToken, checkRole(["admin", "midia"]), upload.single("imagem"), galeriaController.uploadImagem);
// ✅ Atualizar ordem
router.put("/ordem", verifyToken, checkRole(["admin", "midia"]), galeriaController.atualizarOrdem);
// ✅ Atualizar legenda
router.put("/:id", verifyToken, checkRole(["admin", "midia"]), galeriaController.atualizarLegenda);
// ✅ Deletar imagem
router.delete("/:id", verifyToken, checkRole(["admin", "midia"]), galeriaController.deletarImagem);
module.exports = router;

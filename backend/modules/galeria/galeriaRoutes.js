const express = require("express");
const multer = require("multer");
const galeriaController = require("./galeriaController");
const verifyToken = require("../../middlewares/verifyToken");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Listar imagens
router.get("/", galeriaController.listarImagens);

// Upload de imagem
router.post(
  "/upload",
  verifyToken,
  upload.single("imagem"),
  galeriaController.uploadImagem
);




// Atualizar ordem das imagens
router.put("/ordem", verifyToken, galeriaController.atualizarOrdem);

// Atualizar legenda da imagem
router.put('/:id', verifyToken, galeriaController.atualizarLegenda);

// Deletar imagem por ID
router.delete("/:id", verifyToken, galeriaController.deletarImagem);

module.exports = router;

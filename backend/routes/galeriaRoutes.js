const express = require('express');
const multer = require('multer');
const {
  uploadImagem,
  listarImagens,
  atualizarOrdem
} = require('../controllers/galeriaController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', verifyToken, upload.single('imagem'), uploadImagem);
router.get('/', listarImagens);
router.put('/ordem', verifyToken, atualizarOrdem); 

module.exports = router;

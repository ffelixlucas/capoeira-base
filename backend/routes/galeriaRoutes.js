const express = require('express');
const multer = require('multer');
const { uploadImagem, listarImagens } = require('../controllers/galeriaController');
const verifyToken = require('../middlewares/verifyToken')

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', verifyToken, upload.single('imagem'), uploadImagem);
router.get('/', listarImagens);

module.exports = router;

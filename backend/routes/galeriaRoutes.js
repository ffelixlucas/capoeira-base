const express = require('express');
const multer = require('multer');
const { uploadImagem } = require('../controllers/galeriaController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('imagem'), uploadImagem);

module.exports = router;

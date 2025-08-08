const express = require('express');
const router = express.Router();
const agendaController = require('./agendaController');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Rota pública
router.get('/', agendaController.listarEventos);

// Upload com imagem (nova rota!)
router.post(
  '/upload-imagem',
  verifyToken,
  checkRole(['admin', 'instrutor', 'midia']),
  upload.single('imagem'),
  agendaController.criarEventoComImagem
);

// Rotas protegidas
router.post('/', verifyToken, checkRole(['admin', 'instrutor', 'midia']), agendaController.criarEvento);
router.put('/:id', verifyToken, checkRole(['admin', 'instrutor', 'midia']), agendaController.atualizarEvento);
router.delete('/:id', verifyToken, checkRole(['admin', 'instrutor', 'midia']), agendaController.excluirEvento);
// Atualizar status (ativo, concluido, cancelado)
router.put(
  '/:id/status',
  verifyToken,
  checkRole(['admin']),
  agendaController.atualizarStatus
);
router.put(
  '/:id/arquivar',
  verifyToken,
  checkRole(['admin', 'instrutor', 'midia']),
  agendaController.arquivarEvento
);


module.exports = router;

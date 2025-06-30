const express = require('express');
const router = express.Router();
const agendaController = require('./agendaController');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');

// Rota pública (qualquer um pode ver os eventos)
router.get('/', agendaController.listarEventos);

// Rota protegida – somente admin ou instrutor pode criar, editar e excluir eventos
router.post('/', verifyToken, checkRole(['admin', 'instrutor', 'midia']), agendaController.criarEvento);
router.put('/:id', verifyToken, checkRole(['admin', 'instrutor', 'midia']), agendaController.atualizarEvento);
router.delete('/:id', verifyToken, checkRole(['admin', 'instrutor', 'midia']), agendaController.excluirEvento);

module.exports = router;

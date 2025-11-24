const express = require('express');
const router = express.Router();
const controller = require('./lembretesController');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');
// Listar lembretes (todos ou pendentes)
router.get('/', verifyToken, controller.listar);
// Criar lembrete (admin e instrutor)
router.post('/', verifyToken, checkRole(['admin', 'instrutor']), controller.criar);
// Atualizar lembrete (admin e instrutor)
router.put('/:id', verifyToken, checkRole(['admin', 'instrutor']), controller.atualizar);
// Excluir lembrete (somente admin)
router.delete('/:id', verifyToken, checkRole(['admin']), controller.excluir);
module.exports = router;

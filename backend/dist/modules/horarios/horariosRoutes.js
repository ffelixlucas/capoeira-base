const express = require('express');
const router = express.Router();
const horariosController = require('./horariosController');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');
// ✅ Rota pública (listar todos)
router.get('/', horariosController.listarHorarios);
router.get('/:id', horariosController.obterHorario);
// ✅ Rotas protegidas – apenas admin ou instrutor
router.post('/', verifyToken, checkRole(['admin', 'instrutor']), horariosController.criarHorario);
router.put('/atualizar-ordem', verifyToken, checkRole(['admin', 'instrutor']), horariosController.atualizarOrdem);
router.put('/:id', verifyToken, checkRole(['admin', 'instrutor']), horariosController.atualizarHorario);
router.delete('/:id', verifyToken, checkRole(['admin', 'instrutor']), horariosController.excluirHorario);
module.exports = router;

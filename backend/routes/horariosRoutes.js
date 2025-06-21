const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horariosController');

router.get('/', horariosController.listarHorarios);
router.post('/', horariosController.criarHorario);
router.put('/atualizar-ordem', horariosController.atualizarOrdem); // 🔥 🔝 Tem que vir ANTES de :id
router.get('/:id', horariosController.obterHorario);
router.put('/:id', horariosController.atualizarHorario);
router.delete('/:id', horariosController.excluirHorario);

module.exports = router;

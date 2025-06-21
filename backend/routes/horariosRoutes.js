const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horariosController');

router.get('/', horariosController.listarHorarios);
router.get('/:id', horariosController.obterHorario);
router.post('/', horariosController.criarHorario);
router.put('/:id', horariosController.atualizarHorario);
router.delete('/:id', horariosController.excluirHorario);
router.put('/atualizar-ordem', horariosController.atualizarOrdem);


module.exports = router;

const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', agendaController.listarEventos);
router.post('/', verifyToken, agendaController.criarEvento);
router.delete('/:id', verifyToken, agendaController.excluirEvento);

module.exports = router;

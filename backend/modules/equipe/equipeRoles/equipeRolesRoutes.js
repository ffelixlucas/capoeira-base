const express = require('express');
const router = express.Router();
const equipeRolesController = require('./equipeRolesController');
const verifyToken = require('../../../middlewares/verifyToken');
const checkRole = require('../../../middlewares/checkRole');

// Todas as rotas agora exigem ser admin
router.get('/:id/roles', verifyToken, checkRole(['admin']), equipeRolesController.listarRoles);
router.post('/:id/roles', verifyToken, checkRole(['admin']), equipeRolesController.adicionarRole);
router.delete('/:id/roles/:roleId', verifyToken, checkRole(['admin']), equipeRolesController.removerRole);
// Remover TODOS os papéis de um membro
router.delete('/:id/roles', verifyToken, checkRole(['admin']), equipeRolesController.removerTodosOsRoles);


module.exports = router;

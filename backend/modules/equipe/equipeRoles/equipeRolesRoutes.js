const express = require('express');
const router = express.Router();
const equipeRolesController = require('./equipeRolesController');
const verifyToken = require('../../../middlewares/verifyToken');

// Todas as rotas são protegidas por token
router.get('/:id/roles', verifyToken, equipeRolesController.listarRoles);
router.post('/:id/roles', verifyToken, equipeRolesController.adicionarRole);
router.delete('/:id/roles/:roleId', verifyToken, equipeRolesController.removerRole);

module.exports = router;

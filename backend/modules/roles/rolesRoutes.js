const express = require('express');
const router = express.Router();
const rolesController = require('./rolesController');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');

// ✅ Todas as rotas protegidas por token + verificação de role
router.use(verifyToken);
router.use(checkRole(['admin'])); // ← só admin pode mexer com roles

// Rotas
router.get('/', rolesController.getAll);
router.post('/', rolesController.create);
router.put('/:id', rolesController.update);
router.delete('/:id', rolesController.remove);

module.exports = router;

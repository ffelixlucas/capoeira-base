// backend/modules/roles/rolesRoutes.js

const express = require('express');
const router = express.Router();
const rolesController = require('./rolesController');
const verifyToken = require('../../middlewares/verifyToken'); // Proteção JWT

// Todas as rotas protegidas por token
router.use(verifyToken);

router.get('/', rolesController.getAll);          // GET /api/roles → listar papéis
router.post('/', rolesController.create);         // POST /api/roles → criar papel
router.put('/:id', rolesController.update);       // PUT /api/roles/:id → editar papel
router.delete('/:id', rolesController.remove);    // DELETE /api/roles/:id → deletar papel

module.exports = router;

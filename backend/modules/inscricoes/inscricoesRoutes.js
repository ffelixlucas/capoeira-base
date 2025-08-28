//backend/modules/inscricoes/inscricoesRoutes.js

const express = require('express');
const router = express.Router();
const inscricoesController = require('./inscricoesController');
const verifyToken = require('../../middlewares/verifyToken');
const checkRole = require('../../middlewares/checkRole');

// Rotas públicas
router.post('/', inscricoesController.criarInscricao);
router.post('/webhook', inscricoesController.webhookPagamento);


// Rotas protegidas (Admin / Instrutor)
router.get(
  '/detalhes/:id',
  verifyToken,
  checkRole(['admin', 'instrutor']),
  inscricoesController.buscarPorId
);

router.get(
  '/:eventoId',
  verifyToken,
  checkRole(['admin', 'instrutor']),
  inscricoesController.listarPorEvento
);

// Rotas protegidas (Apenas Admin )

router.post(
  "/:id/extornar",
  verifyToken,
  checkRole(["admin"]),
  inscricoesController.extornarPagamento
);


router.put(
    '/:id',
    verifyToken,
    checkRole(['admin']),
    inscricoesController.atualizarInscricao
  );
  
  router.delete(
    "/:id",
    verifyToken,
    checkRole(["admin"]),
    inscricoesController.deletarInscricao
  );

module.exports = router;

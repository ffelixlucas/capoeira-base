// backend/modules/public/inscricoes/inscricoesRoutes.js
const express = require("express");
const {
  gerarPagamentoPix,
  gerarPagamentoCartao,
  webhookPagamento,
  buscarInscricaoPorId,
  reenviarEmail,
  calcularParcelas,
  validarInscricao,
} = require("./inscricoesController");

const router = express.Router();

// Rota para validar inscrição pendente
router.get("/validar", validarInscricao);

// PIX
router.post("/pagamento", gerarPagamentoPix);

// Cartão de crédito
router.post("/pagamento-cartao", gerarPagamentoCartao);

// Consultar opções de parcelamento
router.get("/parcelas", calcularParcelas);

// Rota chamada pelo Mercado Pago quando o pagamento muda de status
router.post("/webhook", webhookPagamento);

// Rota para buscar inscrição por ID (⚠️ deixar depois das rotas fixas)
router.get("/:id", buscarInscricaoPorId);

// Nova rota para reenvio manual de e-mail
router.post("/:id/reenviar-email", reenviarEmail);

module.exports = router;

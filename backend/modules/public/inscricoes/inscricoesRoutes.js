const express = require("express");
const { gerarPagamentoPix, webhookPagamento } = require("./inscricoesController");

const router = express.Router();

router.post("/pagamento", gerarPagamentoPix);

// Rota chamada pelo Mercado Pago quando o pagamento muda de status
router.post("/webhook", webhookPagamento);

module.exports = router;

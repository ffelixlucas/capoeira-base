//backend/modules/public/inscricoes/inscricoesRoutes.js
const express = require("express");
const { gerarPagamentoPix, gerarPagamentoCartao, webhookPagamento, buscarInscricaoPorId, reenviarEmail, calcularParcelas } = require("./inscricoesController");


const router = express.Router();

//PIX
router.post("/pagamento", gerarPagamentoPix);

// Cartão de crédito 
router.post("/pagamento-cartao", gerarPagamentoCartao);

// Consultar opções de parcelamento
router.get("/parcelas", calcularParcelas);


// Rota chamada pelo Mercado Pago quando o pagamento muda de status
router.post("/webhook", webhookPagamento);

router.get("/:id", buscarInscricaoPorId);
module.exports = router;

//  nova rota para reenvio manual
router.post("/:id/reenviar-email", reenviarEmail);
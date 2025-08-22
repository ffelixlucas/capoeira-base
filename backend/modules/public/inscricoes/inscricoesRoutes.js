const express = require("express");
const { gerarPagamentoPix, webhookPagamento, buscarInscricaoPorId, reenviarEmail } = require("./inscricoesController");


const router = express.Router();

router.post("/pagamento", gerarPagamentoPix);

// Rota chamada pelo Mercado Pago quando o pagamento muda de status
router.post("/webhook", webhookPagamento);

const { buscarInscricaoPorId } = require("./inscricoesController");
router.get("/:id", buscarInscricaoPorId);
module.exports = router;

// 👇 nova rota para reenvio manual
router.post("/:id/reenviar-email", reenviarEmail);
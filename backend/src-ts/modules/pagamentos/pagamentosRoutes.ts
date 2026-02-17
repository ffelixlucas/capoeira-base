import { Router } from "express";
import {
  criarCobranca,
  pagarComPix,
  pagarComCartao,
  pagarComBoleto,
  buscarStatusCobranca
} from "./pagamentosController";
import { webhookPagamentos } from "./webhook";

const router = Router();

/* webhook de pagamento (público) */
router.post("/webhook", webhookPagamentos);

/* Criar cobrança (intenção) */
router.post("/:slug", criarCobranca);

/* Gerar pagamento PIX */
router.post("/:slug/:cobrancaId/pix", pagarComPix);

/* Gerar pagamento Cartão */
router.post("/:slug/:cobrancaId/cartao", pagarComCartao);

/* Gerar pagamento Boleto */
router.post("/:slug/:cobrancaId/boleto", pagarComBoleto);

/* Buscar status da cobrança */
router.get("/:slug/:cobrancaId", buscarStatusCobranca);


export default router;

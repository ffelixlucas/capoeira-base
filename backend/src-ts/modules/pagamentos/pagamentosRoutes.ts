import { Router } from "express";
import {
  criarCobranca,
  pagarComPix,
  pagarComCartao,
  pagarComBoleto,
} from "./pagamentosController";

const router = Router();

/* ======================================================
   Criar cobrança (intenção)
   POST /api/pagamentos/:slug
====================================================== */
router.post("/:slug", criarCobranca);

/* ======================================================
   Gerar pagamento PIX
   POST /api/pagamentos/:slug/:cobrancaId/pix
====================================================== */
router.post("/:slug/:cobrancaId/pix", pagarComPix);

/* ======================================================
   Gerar pagamento Cartão
   POST /api/pagamentos/:slug/:cobrancaId/cartao
====================================================== */
router.post("/:slug/:cobrancaId/cartao", pagarComCartao);

/* ======================================================
   Gerar pagamento Boleto
   POST /api/pagamentos/:slug/:cobrancaId/boleto
====================================================== */
router.post("/:slug/:cobrancaId/boleto", pagarComBoleto);

export default router;

import { Request, Response } from "express";
import logger from "../../utils/logger";
import {
  criarCobrancaService,
  gerarPagamentoPixService,
  gerarPagamentoCartaoService,
  gerarPagamentoBoletoService,
} from "./pagamentosService";
import {
  buscarOrganizacaoPorSlug,
  buscarCobrancaPorId,
} from "./pagamentosRepository";

/* ======================================================
   Criar cobrança (intenção)
====================================================== */

export async function criarCobranca(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    const org = await buscarOrganizacaoPorSlug(slug);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organização não encontrada para o slug informado",
      });
    }

    const resultado = await criarCobrancaService({
      ...req.body,
      organizacao_id: org.id,
    });

    return res.json({
      success: true,
      data: resultado,
    });
  } catch (error: any) {
    logger.error("[pagamentosController] Erro criarCobranca", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar cobrança",
    });
  }
}

/* ======================================================
   PIX
====================================================== */

export async function pagarComPix(req: Request, res: Response) {
  try {
    const { cobrancaId } = req.params;

    const cobranca = await buscarCobrancaPorId(Number(cobrancaId));
    if (!cobranca) {
      return res.status(404).json({
        success: false,
        message: "Cobrança não encontrada",
      });
    }

    const pagamento = await gerarPagamentoPixService(cobranca);

    return res.json({ success: true, data: pagamento });
  } catch (error: any) {
    logger.error("[pagamentosController] Erro pagarComPix", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao gerar pagamento PIX",
    });
  }
}

/* ======================================================
   CARTÃO
====================================================== */

export async function pagarComCartao(req: Request, res: Response) {
  try {
    const { cobrancaId } = req.params;

    const cobranca = await buscarCobrancaPorId(Number(cobrancaId));
    if (!cobranca) {
      return res.status(404).json({
        success: false,
        message: "Cobrança não encontrada",
      });
    }

    const pagamento = await gerarPagamentoCartaoService({
      ...cobranca,
      ...req.body, // token, payment_method_id, installments, issuer_id
    });

    return res.json({ success: true, data: pagamento });
  } catch (error: any) {
    logger.error("[pagamentosController] Erro pagarComCartao", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao gerar pagamento Cartão",
    });
  }
}

/* ======================================================
   BOLETO
====================================================== */

export async function pagarComBoleto(req: Request, res: Response) {
  try {
    const { cobrancaId } = req.params;

    const cobranca = await buscarCobrancaPorId(Number(cobrancaId));
    if (!cobranca) {
      return res.status(404).json({
        success: false,
        message: "Cobrança não encontrada",
      });
    }

    const pagamento = await gerarPagamentoBoletoService(cobranca);

    return res.json({ success: true, data: pagamento });
  } catch (error: any) {
    logger.error("[pagamentosController] Erro pagarComBoleto", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao gerar pagamento Boleto",
    });
  }
}

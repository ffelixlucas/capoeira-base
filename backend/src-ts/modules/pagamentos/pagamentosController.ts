import { Request, Response } from "express";
import logger from "../../utils/logger";
import {
  criarCobrancaService,
  gerarPagamentoPixService,
  gerarPagamentoCartaoService,
  gerarPagamentoBoletoService,
  buscarPagamentoMP,
} from "./pagamentosService";
import {
  buscarOrganizacaoPorSlug,
  buscarCobrancaPorId,
  buscarCobrancaPorIdRepository,
  atualizarCobrancaPagamentoRepository,
} from "./pagamentosRepository";
import { resolverCredenciaisMercadoPagoPorOrganizacaoId } from "../shared/organizacoes/organizacaoService";
import { processarCobrancaPaga } from "./processarCobrancaPaga";

function mapearStatusMP(statusMP?: string): string {
  if (statusMP === "approved") return "pago";
  if (statusMP === "pending") return "pendente";
  if (statusMP === "rejected") return "rejeitado";
  if (statusMP === "cancelled") return "cancelado";
  return "pendente";
}

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
/* ======================================================
   Buscar status da cobrança
====================================================== */

export async function buscarStatusCobranca(req: Request, res: Response) {
  try {
    const { cobrancaId } = req.params;

    let cobranca = await buscarCobrancaPorIdRepository(Number(cobrancaId));

    if (!cobranca) {
      return res.status(404).json({
        success: false,
        message: "Cobrança não encontrada",
      });
    }

    // Fallback resiliente: se webhook falhar/atrasar, sincroniza status consultando o gateway.
    if (cobranca.status === "pendente" && cobranca.pagamento_id) {
      try {
        const credenciais = await resolverCredenciaisMercadoPagoPorOrganizacaoId(
          Number(cobranca.organizacao_id)
        );
        const pagamento = await buscarPagamentoMP(
          String(cobranca.pagamento_id),
          credenciais.accessToken
        );
        const statusInterno = mapearStatusMP(pagamento?.status);

        if (statusInterno !== cobranca.status) {
          await atualizarCobrancaPagamentoRepository({
            cobranca_id: Number(cobranca.id),
            status: statusInterno,
            status_detail: pagamento?.status_detail || null,
            pagamento_id: pagamento?.id || undefined,
          });

          if (statusInterno === "pago") {
            await processarCobrancaPaga(Number(cobranca.id));
          }

          cobranca = await buscarCobrancaPorIdRepository(Number(cobrancaId));
        }
      } catch (syncError: any) {
        logger.warn("[pagamentosController] Falha ao sincronizar status no fallback", {
          cobrancaId: Number(cobrancaId),
          erro: syncError?.message,
        });
      }
    }

    return res.json({
      success: true,
      data: {
        id: cobranca.id,
        status: cobranca.status,
        origem: cobranca.origem,
        entidade_id: cobranca.entidade_id,
      },
    });
  } catch (error: any) {
    logger.error("[pagamentosController] Erro buscarStatusCobranca", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar status da cobrança",
    });
  }
}

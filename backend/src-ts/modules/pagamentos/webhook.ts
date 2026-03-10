import { buscarPagamentoMP } from "./pagamentosService";
import {
  atualizarCobrancaPagamentoRepository, buscarCobrancaPorIdRepository
} from "./pagamentosRepository";
import { processarCobrancaPaga } from "./processarCobrancaPaga";
import { resolverCredenciaisMercadoPagoPorOrganizacaoId } from "../shared/organizacoes/organizacaoService";
import logger from "../../utils/logger";

/* ======================================================
   Mapear status do Mercado Pago → padrão interno
====================================================== */

function mapearStatusMP(statusMP: string): string {
  if (statusMP === "approved") return "pago";
  if (statusMP === "pending") return "pendente";
  if (statusMP === "rejected") return "rejeitado";
  if (statusMP === "cancelled") return "cancelado";
  return "pendente";
}

function mascararEmail(email?: string): string | null {
  if (!email) return null;
  const [local, domain] = String(email).split("@");
  if (!local || !domain) return "***";
  const inicio = local.slice(0, 2);
  return `${inicio}***@${domain}`;
}

function mascararTelefone(telefone?: string): string | null {
  if (!telefone) return null;
  const digits = String(telefone).replace(/\D/g, "");
  if (digits.length <= 4) return "***";
  return `***${digits.slice(-4)}`;
}

function mascararPagamentoId(id: any): string | null {
  const digits = String(id || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length <= 6) return `***${digits.slice(-2)}`;
  return `${digits.slice(0, 3)}***${digits.slice(-3)}`;
}

export async function webhookPagamentos(req, res) {
  try {
    logger.debug("[webhookPagamentos] webhook recebido", {
      query: req.query,
      body: req.body,
    });
    const paymentId =
      req.body?.data?.id ||
      req.body?.resource; if (!paymentId) {
        return res.status(200).json({ ignored: true });
      }

    const orgId = Number(req.query?.org || req.body?.organization_id || 0);
    let accessToken: string | undefined;
    if (orgId > 0) {
      const cred = await resolverCredenciaisMercadoPagoPorOrganizacaoId(orgId);
      accessToken = cred.accessToken;
    }

    const pagamento = await buscarPagamentoMP(String(paymentId), accessToken);

    const cobrancaId = Number(pagamento.external_reference);
    if (!cobrancaId) {
      return res.status(200).json({ ignored: true });
    }

    const cobranca = await buscarCobrancaPorIdRepository(cobrancaId);

    logger.debug("[webhookPagamentos] status atual da cobranca", {
      id: cobranca?.id,
      organizacao_id: cobranca?.organizacao_id,
      origem: cobranca?.origem,
      entidade_id: cobranca?.entidade_id,
      status: cobranca?.status,
      consequencia_executada: cobranca?.consequencia_executada,
      pagamento_id: mascararPagamentoId(cobranca?.pagamento_id),
      telefone: mascararTelefone(cobranca?.telefone),
      email: mascararEmail(cobranca?.email),
    });

    // 🔒 BLOQUEIO DEFINITIVO
    if (cobranca?.status === "estornado") {
      logger.info("[webhookPagamentos] webhook ignorado: cobranca ja estornada", {
        cobrancaId,
      });
      return res.status(200).json({ ignored: "already_refunded" });
    }

    if (cobranca?.consequencia_executada === 1) {
      logger.info("[webhookPagamentos] webhook ignorado: consequencia ja executada", {
        cobrancaId,
      });
      return res.status(200).json({ ignored: "already_processed" });
    }


    const statusInterno = mapearStatusMP(pagamento.status);

    // 🔒 NÃO permitir downgrade de pago → pendente
    if (
      statusInterno === "pendente" &&
      cobranca?.status === "pago"
    ) {
      logger.info("[webhookPagamentos] downgrade ignorado de pago para pendente", {
        cobrancaId,
      });
      return res.status(200).json({ ignored: "no_downgrade" });
    }

    await atualizarCobrancaPagamentoRepository({
      cobranca_id: cobrancaId,
      status: statusInterno,
      status_detail: pagamento.status_detail,
      pagamento_id: pagamento.id,
    });

    if (statusInterno === "pago") {
      await processarCobrancaPaga(cobrancaId);
    }

    return res.status(200).json({ processed: true });
  } catch (error) {
    logger.error("[webhookPagamentos] erro no processamento", {
      erro: error?.message,
    });
    return res.status(500).json({ error: "webhook_error" });
  }
}

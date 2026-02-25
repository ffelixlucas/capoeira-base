import { buscarPagamentoMP } from "./pagamentosService";
import {
  atualizarCobrancaPagamentoRepository, buscarCobrancaPorIdRepository
} from "./pagamentosRepository";
import { processarCobrancaPaga } from "./processarCobrancaPaga";

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

export async function webhookPagamentos(req, res) {
  try {
    console.log("WEBHOOK RECEBIDO:", JSON.stringify(req.body, null, 2));
    const paymentId =
      req.body?.data?.id ||
      req.body?.resource; if (!paymentId) {
        return res.status(200).json({ ignored: true });
      }

    const pagamento = await buscarPagamentoMP(String(paymentId));

    const cobrancaId = Number(pagamento.external_reference);
    if (!cobrancaId) {
      return res.status(200).json({ ignored: true });
    }

    const cobranca = await buscarCobrancaPorIdRepository(cobrancaId);

    console.log("STATUS ATUAL NO BANCO:", cobranca);

    // 🔒 BLOQUEIO DEFINITIVO
    if (cobranca?.status === "estornado") {
      console.log("Webhook ignorado: cobrança já estornada");
      return res.status(200).json({ ignored: "already_refunded" });
    }

    if (cobranca?.consequencia_executada === 1) {
      console.log("Webhook ignorado: consequência já executada");
      return res.status(200).json({ ignored: "already_processed" });
    }


    const statusInterno = mapearStatusMP(pagamento.status);

    // 🔒 NÃO permitir downgrade de pago → pendente
    if (
      statusInterno === "pendente" &&
      cobranca?.status === "pago"
    ) {
      console.log("Ignorando downgrade de pago para pendente");
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
    return res.status(500).json({ error: "webhook_error" });
  }
}
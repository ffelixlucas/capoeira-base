import { buscarPagamentoMP } from "./pagamentosService";
import {
  atualizarCobrancaPagamentoRepository,
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
    const paymentId = req.body?.data?.id;
    if (!paymentId) {
      return res.status(200).json({ ignored: true });
    }

    const pagamento = await buscarPagamentoMP(String(paymentId));

    const cobrancaId = Number(pagamento.external_reference);
    if (!cobrancaId) {
      return res.status(200).json({ ignored: true });
    }

    const statusInterno = mapearStatusMP(pagamento.status);

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

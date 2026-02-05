import { buscarPagamentoMP } from "./pagamentosService";
import {
  atualizarCobrancaPagamentoRepository,
} from "./pagamentosRepository";
import { processarCobrancaPaga } from "./processarCobrancaPaga";

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

    // Atualiza SOMENTE o status (idempotente)
    await atualizarCobrancaPagamentoRepository({
      cobranca_id: cobrancaId,
      status: pagamento.status,          // approved | pending | rejected
      status_detail: pagamento.status_detail,
      pagamento_id: pagamento.id,
    });

    if (pagamento.status === "approved") {
      await processarCobrancaPaga(cobrancaId);
    }


    return res.status(200).json({ processed: true });
  } catch (error) {
    return res.status(500).json({ error: "webhook_error" });
  }
}

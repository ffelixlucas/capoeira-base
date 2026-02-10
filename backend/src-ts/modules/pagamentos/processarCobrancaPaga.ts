import logger from "../../utils/logger";
import {
  buscarCobrancaPorIdRepository,
  marcarConsequenciaExecutadaRepository,
} from "./pagamentosRepository";
import { converterPedidoPorId } from "../pedidos/pedidosService";
import { atualizarDadosPedidoAposPagamento } from "../pedidos/pedidosRepository";
import { dispararEventoEmail } from "../notificacoes/notificacoesEventosService";





export async function processarCobrancaPaga(cobrancaId: number) {
  const cobranca = await buscarCobrancaPorIdRepository(cobrancaId);

  if (!cobranca) {
    logger.warn("[processarCobrancaPaga] Cobrança não encontrada", {
      cobrancaId,
    });
    return;
  }

  if (cobranca.status !== "pago") {
  logger.warn("[processarCobrancaPaga] Cobrança não está paga", {
    cobrancaId,
    status: cobranca.status,
  });
  return;
}


  if (cobranca.consequencia_executada) {
    logger.info("[processarCobrancaPaga] Já processada, ignorando", {
      cobrancaId,
    });
    return;
  }

logger.info("[processarCobrancaPaga] Processando pela primeira vez", {
  cobrancaId,
  origem: cobranca.origem,
  entidade_id: cobranca.entidade_id,
});

if (cobranca.origem === "loja") {
  await converterPedidoPorId(
    cobranca.organizacao_id,
    cobranca.entidade_id
  );
  await atualizarDadosPedidoAposPagamento({
  organizacaoId: cobranca.organizacao_id,
  pedidoId: cobranca.entidade_id,
  nome: cobranca.nome_pagador,
  telefone: cobranca.telefone,
  email: cobranca.email,
});
await dispararEventoEmail({
  organizacaoId: cobranca.organizacao_id,
  tipo: "loja",
  subject: "Novo pedido recebido – loja",
  html: `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <p><strong>Novo pedido recebido</strong></p>
      <p>Cliente: ${cobranca.nome_pagador}</p>
      <p>Pedido ID: ${cobranca.entidade_id}</p>
      <p>Status: em separação</p>
    </div>
  `,
});


}


  // 🔒 AQUI entram as consequências NO FUTURO:
  // - loja    → baixar estoque / e-mail
  // - evento  → confirmar inscrição
  // - mensal  → marcar como quitada
  // - matrícula → liberar acesso

  await marcarConsequenciaExecutadaRepository(cobrancaId);

  logger.info("[processarCobrancaPaga] Finalizado com sucesso", {
    cobrancaId,
  });
}

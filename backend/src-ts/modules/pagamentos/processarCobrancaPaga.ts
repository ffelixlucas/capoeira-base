import logger from "../../utils/logger";
import {
  buscarCobrancaPorIdRepository,
  marcarConsequenciaExecutadaRepository,
} from "./pagamentosRepository";
import { converterPedidoPorId } from "../pedidos/pedidosService";
import { atualizarDadosPedidoAposPagamento } from "../pedidos/pedidosRepository";
import { dispararEventoEmail } from "../notificacoes/notificacoesEventosService";
import estoqueRepository from "../estoque/estoqueRepository";
import emailService from "../../services/emailService";
import { buscarPedidoPorId } from "../pedidos/pedidosService";
import { getEmails } from "../notificacaoDestinos/notificacaoDestinosService";






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

  // 🔒 Marca como executada antes de processar
await marcarConsequenciaExecutadaRepository(cobrancaId);


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
  await estoqueRepository.baixarEstoquePorPedido({
  pedidoId: cobranca.entidade_id,
  organizacaoId: cobranca.organizacao_id,
});

  await atualizarDadosPedidoAposPagamento({
  organizacaoId: cobranca.organizacao_id,
  pedidoId: cobranca.entidade_id,
  nome: cobranca.nome_pagador,
  telefone: cobranca.telefone,
  email: cobranca.email,
});

const pedidoCompleto = await buscarPedidoPorId(
  cobranca.organizacao_id,
  cobranca.entidade_id
);

// 🔔 Buscar e-mails configurados para notificações da loja
const emailsAdmin = await getEmails(
  cobranca.organizacao_id,
  "loja"
);

logger.debug("[processarCobrancaPaga] Emails admin loja", {
  organizacaoId: cobranca.organizacao_id,
  emailsAdmin,
});


// 📧 Email para ADMIN (dinâmico por organização)
if (emailsAdmin.length > 0) {
  for (const email of emailsAdmin) {
    await emailService.enviarEmailPedidoAdmin({
      pedido: pedidoCompleto,
      emailDestino: email,
    });
  }
} else {
  logger.warn("[processarCobrancaPaga] Nenhum email admin configurado para loja", {
    organizacaoId: cobranca.organizacao_id,
  });
}


// 📧 Email para CLIENTE com dados completos do pedido
await emailService.enviarEmailPedidoCliente({
  pedido: pedidoCompleto
});

}


  // 🔒 AQUI entram as consequências NO FUTURO:
  // - loja    → baixar estoque / e-mail
  // - evento  → confirmar inscrição
  // - mensal  → marcar como quitada
  // - matrícula → liberar acesso


  logger.info("[processarCobrancaPaga] Finalizado com sucesso", {
    cobrancaId,
  });
}

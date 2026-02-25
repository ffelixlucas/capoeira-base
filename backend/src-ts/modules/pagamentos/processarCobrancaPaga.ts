import logger from "../../utils/logger";
import {
  buscarCobrancaPorIdRepository,
  marcarConsequenciaExecutadaRepository,
} from "./pagamentosRepository";
import { converterPedidoPorId } from "../pedidos/pedidosService";
import { atualizarDadosPedidoAposPagamento } from "../pedidos/pedidosRepository";
import estoqueRepository from "../estoque/estoqueRepository";
import emailService from "../../services/emailService";
import { buscarPedidoPorId } from "../pedidos/pedidosService";
import { getEmails } from "../notificacaoDestinos/notificacaoDestinosService";
import { withTransaction } from "../../database/connection";

export async function processarCobrancaPaga(cobrancaId: number) {
  const cobranca = await buscarCobrancaPorIdRepository(cobrancaId);

  if (!cobranca) {
    logger.warn("[processarCobrancaPaga] Cobrança não encontrada", {
      cobrancaId,
    });
    return;
  }

  if (cobranca.status === "estornado") {
    logger.warn("[processarCobrancaPaga] Cobrança já estornada, ignorando", {
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




  if (cobranca.origem === "loja") {

    let marcou = false;

    await withTransaction(async (connection) => {

      // 🔐 PRIMEIRA COISA: tentar marcar
      marcou = await marcarConsequenciaExecutadaRepository(        cobrancaId,
        connection
      );

      if (!marcou) {
        logger.info("[processarCobrancaPaga] Já processado por outro webhook", {
          cobrancaId,
        });
        return;
      }
      logger.info("[processarCobrancaPaga] Processando pela primeira vez", {
        cobrancaId,
        origem: cobranca.origem,
        entidade_id: cobranca.entidade_id,
      });
      // 👇 só continua se marcou com sucesso

      await converterPedidoPorId(
        cobranca.organizacao_id,
        cobranca.entidade_id,
        connection
      );

      await estoqueRepository.baixarEstoquePorPedido(
        {
          pedidoId: cobranca.entidade_id,
          organizacaoId: cobranca.organizacao_id,
        },
        connection
      );

      await atualizarDadosPedidoAposPagamento(
        {
          organizacaoId: cobranca.organizacao_id,
          pedidoId: cobranca.entidade_id,
          nome: cobranca.nome_pagador,
          telefone: cobranca.telefone,
          email: cobranca.email,
        },
        connection
      );

    });

    if (!marcou) {
      return;
    }

    const pedidoCompleto = await buscarPedidoPorId(
      cobranca.organizacao_id,
      cobranca.entidade_id
    );

    const emailsAdmin = await getEmails(
      cobranca.organizacao_id,
      "loja"
    );

    logger.debug("[processarCobrancaPaga] Emails admin loja", {
      organizacaoId: cobranca.organizacao_id,
      emailsAdmin,
    });

    if (emailsAdmin.length > 0) {
      for (const email of emailsAdmin) {
        await emailService.enviarEmailPedidoAdmin({
          pedido: pedidoCompleto,
          emailDestino: email,
        });
      }
    } else {
      logger.warn(
        "[processarCobrancaPaga] Nenhum email admin configurado para loja",
        { organizacaoId: cobranca.organizacao_id }
      );
    }

    await emailService.enviarEmailPedidoCliente({
      pedido: pedidoCompleto,
    });
  }

  logger.info("[processarCobrancaPaga] Finalizado com sucesso", {
    cobrancaId,
  });
}

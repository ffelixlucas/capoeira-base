import {
  buscarPedidoComItens,
  converterPedido, listarPedidosPorOrganizacao, atualizarStatusPedidoCancelado , buscarEstatisticasPedidos, atualizarStatusPedidoEntregue
} from "./pedidosRepository";
import { reverterEstoque } from "../estoque/estoqueRepository";
import { atualizarCobrancaPagamentoRepository, buscarPagamentoPorPedido } from "../pagamentos/pagamentosRepository";
import { atualizarPedidoEstornado } from "./pedidosRepository";
import { PoolConnection } from "mysql2/promise";
import axios from "axios";
import { logger } from "../../utils/logger";
import { withTransaction } from "../../database/connection";
import { resolverCredenciaisMercadoPagoPorOrganizacaoId } from "../shared/organizacoes/organizacaoService";

function mascararPagamentoId(id: any): string {
  const digits = String(id || "").replace(/\D/g, "");
  if (!digits) return "***";
  if (digits.length <= 6) return `***${digits.slice(-2)}`;
  return `${digits.slice(0, 3)}***${digits.slice(-3)}`;
}

export async function buscarPedidoPorId(
  organizacaoId: number,
  pedidoId: number
) {
  return buscarPedidoComItens(organizacaoId, pedidoId);
}

export async function converterPedidoPorId(
  organizacaoId: number,
  pedidoId: number,
  trx?: PoolConnection
) {
  const affectedRows = await converterPedido(
    organizacaoId,
    pedidoId,
    trx
  );

  if (affectedRows === 1) {
    logger.info("[pedidosService] Pedido convertido", {
      organizacaoId,
      pedidoId,
    });
  } else {
    logger.info("[pedidosService] Pedido já convertido ou inexistente", {
      organizacaoId,
      pedidoId,
    });
  }

  return affectedRows;
}

export async function listarPedidosPorOrg(
  organizacaoId: number,
  filtros: {
    status_financeiro?: string;
    status_operacional?: string;
    data_inicio?: string;
    data_fim?: string;
  },
  cursor?: {
    criado_em: string;
    id: number;
  },
  limite: number = 20
) {
  logger.debug("[pedidosService] listando pedidos", {
    organizacaoId,
    filtros,
    cursor,
    limite,
  });

  const pedidos = await listarPedidosPorOrganizacao(
    organizacaoId,
    filtros,
    cursor,
    limite
  );

  let next_cursor = null;

  if (pedidos.length === limite) {
    const ultimo = pedidos[pedidos.length - 1];
    next_cursor = {
      criado_em: ultimo.criado_em,
      id: ultimo.id,
    };
  }

  return {
    dados: pedidos,
    next_cursor,
  };
}

export async function cancelarPedidoPorId(
  organizacaoId: number,
  pedidoId: number
) {
  return await atualizarStatusPedidoCancelado(organizacaoId, pedidoId);
}
export async function obterEstatisticasPedidos(
  organizacaoId: number
) {
  logger.debug("[pedidosService] buscando estatísticas", {
    organizacaoId,
  });

  return await buscarEstatisticasPedidos(organizacaoId);
}
export async function marcarPedidoEntregue(
  pedidoId: number,
  organizacaoId: number
) {
  logger.info("[pedidosService] Marcando pedido como entregue", {
    organizacaoId,
    pedidoId,
  });

  return await atualizarStatusPedidoEntregue(
    organizacaoId,
    pedidoId
  );
}

export async function estornarPedidoService(
  organizacaoId: number,
  pedidoId: number
) {
  return await withTransaction(async (trx) => {

    // 1️⃣ Buscar pedido (fora da trx está ok, mas vamos manter padrão)
    const pedido = await buscarPedidoPorId(organizacaoId, pedidoId);

    if (!pedido) {
      throw new Error("Pedido não encontrado");
    }

    if (pedido.status_financeiro !== "pago") {
      throw new Error("Pedido não está pago, não pode ser estornado");
    }

    // 2️⃣ Buscar pagamento dentro da trx
    const pagamento = await buscarPagamentoPorPedido(
      organizacaoId,
      pedidoId,
      trx
    );

    if (!pagamento) {
      throw new Error("Pagamento não encontrado");
    }

    if (pagamento.status !== "pago") {
      throw new Error("Pagamento não está pago");
    }

    logger.debug("[estorno] pagamento_id usado", {
      pagamento_id: mascararPagamentoId(pagamento.pagamento_id)
    });

    // 3️⃣ Estorno Mercado Pago (externo, antes de mexer no banco)
    const credenciais = await resolverCredenciaisMercadoPagoPorOrganizacaoId(
      organizacaoId
    );

    await axios.post(
      `https://api.mercadopago.com/v1/payments/${pagamento.pagamento_id}/refunds`,
      {},
      {
        headers: {
          Authorization: `Bearer ${credenciais.accessToken}`,
        },
      }
    );

    // 4️⃣ Reverter estoque dentro da trx
    for (const item of pedido.itens) {
      await reverterEstoque(
        organizacaoId,
        item.sku_id,
        item.quantidade,
        pedidoId,
        trx
      );
    }

    // 5️⃣ Atualizar pagamento dentro da trx
    await atualizarCobrancaPagamentoRepository(
      {
        cobranca_id: pagamento.id,
        status: "estornado",
      },
      trx
    );

    // 6️⃣ Atualizar pedido dentro da trx
    await atualizarPedidoEstornado(
      organizacaoId,
      pedidoId,
      trx
    );

    logger.info("[estorno] Pedido estornado com transação", {
      organizacaoId,
      pedidoId,
    });

    return { success: true };
  });
}

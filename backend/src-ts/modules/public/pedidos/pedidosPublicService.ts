import {
  buscarSkusPorIds,
  criarPedido,
  criarPedidoItens,
  buscarOrganizacaoPorSlug,
  buscarPedidoComItensPublic
} from "./pedidosPublicRepository";
import logger from "../../../utils/logger";

type ItemCheckout = {
  skuId: number;
  quantidade: number;
};

type FinalizarPedidoInput = {
  slug: string;
  cpf: string;
  nome: string;
  telefone: string;
  email: string;
  itens: ItemCheckout[];
};

export async function finalizarPedidoPublicService(
  data: FinalizarPedidoInput
) {
const { slug, cpf, nome, telefone, email, itens } = data;

  const organizacao = await buscarOrganizacaoPorSlug(slug);

  if (!organizacao) {
    throw new Error("Organização inválida");
  }

  const organizacaoId = organizacao.id;

  const skuIds = itens.map((item) => item.skuId);
  const skus = await buscarSkusPorIds(organizacaoId, skuIds);

  if (skus.length !== skuIds.length) {
    throw new Error("Um ou mais SKUs são inválidos");
  }

  let valorTotal = 0;

  const itensCalculados = itens.map((item) => {
    const sku = skus.find((s) => s.id === item.skuId);

    if (!sku || !sku.ativo) {
      throw new Error(`SKU ${item.skuId} indisponível`);
    }
    
    // 🔒 Validação de estoque antes de criar pedido
    if (!sku.encomenda) {
      if (sku.quantidade < item.quantidade) {
        throw new Error(
          `Estoque insuficiente para SKU ${item.skuId}`
        );
      }
    }
    

    const subtotal = sku.preco * item.quantidade;
    valorTotal += subtotal;

    return {
      sku_id: item.skuId,
      quantidade: item.quantidade,
      preco_unitario: sku.preco,
    };
  });

  logger.debug("[checkout] valores calculados", {
    valorTotal,
    totalItens: itensCalculados.length,
  });
  
  const pedido = await criarPedido({
    organizacaoId,
    nome,
    telefone,
    email,
    valor_total: valorTotal,
    total_itens: itensCalculados.length,
  });



  await criarPedidoItens({
    organizacaoId,
    pedidoId: pedido.id,
    itens: itensCalculados,
  });

  return {
    id: pedido.id,
    valor_total: valorTotal,
  };
}


type BuscarPedidoPublicInput = {
  slug: string;
  pedidoId: number;
};

export async function buscarPedidoPublicService(
  data: BuscarPedidoPublicInput
) {
  const { slug, pedidoId } = data;

  logger.debug("[pedidosPublicService] buscarPedidoPublicService", {
    slug,
    pedidoId,
  });

  if (!slug) {
    throw new Error("slug é obrigatório");
  }

  if (!pedidoId) {
    throw new Error("pedidoId é obrigatório");
  }

  const organizacao = await buscarOrganizacaoPorSlug(slug);

  if (!organizacao) {
    throw new Error("Organização não encontrada");
  }

  const pedido = await buscarPedidoComItensPublic(
    organizacao.id,
    pedidoId
  );

  if (!pedido) {
    throw new Error("Pedido não encontrado");
  }

  return pedido;
}
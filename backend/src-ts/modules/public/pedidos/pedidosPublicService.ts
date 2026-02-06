import {
  buscarSkusPorIds,
  criarPedido,
  criarPedidoItens,
  buscarOrganizacaoPorSlug,
} from "./pedidosPublicRepository";

type ItemCheckout = {
  skuId: number;
  quantidade: number;
};

type FinalizarPedidoInput = {
  slug: string;
  cpf: string;
  nome: string;
  telefone: string;
  itens: ItemCheckout[];
};

export async function finalizarPedidoPublicService(
  data: FinalizarPedidoInput
) {
  const { slug, cpf, nome, telefone, itens } = data;

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

    const subtotal = sku.preco * item.quantidade;
    valorTotal += subtotal;

    return {
      sku_id: item.skuId,
      quantidade: item.quantidade,
      preco_unitario: sku.preco,
    };
  });

const pedido = await criarPedido({
  organizacaoId,
  
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

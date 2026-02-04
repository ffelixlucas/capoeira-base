import { buscarSkusPorIds } from "./carrinhoPublicRepository";

type ItemCheckout = {
  skuId: number;
  quantidade: number;
};

type CheckoutInput = {
  organizacaoId: number;
  cpf: string;
  nome: string;
  telefone: string;
  itens: ItemCheckout[];
};

export async function processarCheckoutPublic(data: CheckoutInput) {
  const { organizacaoId, itens } = data;

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
      skuId: item.skuId,
      quantidade: item.quantidade,
      precoUnitario: sku.preco,
      subtotal,
    };
  });

  return {
    valorTotal,
    itens: itensCalculados,
  };
}

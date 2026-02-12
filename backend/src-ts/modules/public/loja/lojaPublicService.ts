import lojaPublicRepository from "./lojaPublicRepository";

class LojaPublicService {
  async listarSkusDisponiveis(slug: string) {
    if (!slug) {
      throw new Error("slug é obrigatório");
    }

    return lojaPublicRepository.listarSkusDisponiveisPorSlug(slug);
  }
  async buscarSkuPorId(slug: string, skuId: number) {
  return await lojaPublicRepository.buscarSkuPorId(
    slug,
    skuId
  );
}

async listarProdutosDisponiveis(slug: string) {
  if (!slug) {
    throw new Error("slug é obrigatório");
  }

  return lojaPublicRepository.listarProdutosDisponiveisPorSlug(slug);
}

async buscarProdutoComSkus(slug: string, produtoId: number) {
  if (!slug) {
    throw new Error("slug é obrigatório");
  }

  if (!produtoId) {
    throw new Error("produtoId é obrigatório");
  }

  return lojaPublicRepository.buscarProdutoComSkus(
    slug,
    produtoId
  );
}


}

export default new LojaPublicService();

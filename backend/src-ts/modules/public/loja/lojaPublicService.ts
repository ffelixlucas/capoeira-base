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

}

export default new LojaPublicService();

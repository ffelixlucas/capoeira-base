import lojaPublicRepository from "./lojaPublicRepository";

class LojaPublicService {
  async listarSkusDisponiveis(slug: string) {
    if (!slug) {
      throw new Error("slug é obrigatório");
    }

    return lojaPublicRepository.listarSkusDisponiveisPorSlug(slug);
  }
}

export default new LojaPublicService();

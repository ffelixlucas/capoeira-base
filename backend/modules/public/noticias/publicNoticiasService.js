const logger = require("../../../utils/logger.js");
const organizacaoServiceModule = require("../../shared/organizacoes/organizacaoService");
const galeriaRepository = require("../../galeria/galeriaRepository");

const organizacaoService = organizacaoServiceModule.default || organizacaoServiceModule;

async function listarNoticiasPublicas(slug) {
  if (!slug) {
    const error = new Error("Slug da organização não informado.");
    error.statusCode = 400;
    throw error;
  }

  if (!organizacaoService?.buscarPorSlug) {
    const error = new Error("Serviço de organização indisponível.");
    error.statusCode = 500;
    throw error;
  }

  const org = await organizacaoService.buscarPorSlug(slug);
  if (!org) {
    const error = new Error("Organização não encontrada.");
    error.statusCode = 404;
    throw error;
  }

  const noticias = await galeriaRepository.buscarImagensPublicas(org.id);

  logger.info("[publicNoticiasService] Notícias públicas listadas", {
    slug,
    organizacaoId: org.id,
    total: noticias.length,
  });

  return { organizacaoId: org.id, noticias };
}

module.exports = {
  listarNoticiasPublicas,
};

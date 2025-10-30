const organizacaoService = require("./organizacaoService");
const logger = require("../../../utils/logger");

/**
 * 🔹 Retorna dados públicos da organização via slug
 */
async function getOrganizacaoPublica(req, res) {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: "Slug não informado" });
    }

    const org = await organizacaoService.buscarPorSlug(slug);
    if (!org) {
      return res.status(404).json({ error: "Organização não encontrada" });
    }

    logger.debug(
      `[organizacaoPublicController] Organização pública encontrada: ${org.nome_fantasia} (org ${org.id})`
    );

    return res.json({
      organizacao_id: org.id,
      nome: org.nome,
      nome_fantasia: org.nome_fantasia,
      grupo: org.grupo,
      cidade: org.cidade,
      estado: org.estado,
      pais: org.pais,
      slug: org.slug,
    });
  } catch (err) {
    logger.error(
      "[organizacaoPublicController] Erro ao buscar organização pública:",
      err.message
    );
    return res.status(500).json({ error: "Erro ao buscar organização" });
  }
}

module.exports = { getOrganizacaoPublica };

const logger = require("../../../utils/logger.js");
const publicAgendaService = require("./publicAgendaService");
const organizacaoService = require("../../shared/organizacoes/organizacaoService");

async function listarEventosPublicos(req, res) {
  try {
    const { slug } = req.query;
    logger.debug("[publicAgendaController] Listando eventos públicos", {
      slug,
    });

    if (!slug) {
      return res
        .status(400)
        .json({ sucesso: false, erro: "Slug da organização não informado." });
    }

    // 🔹 Busca a organização pelo slug
    const org = await organizacaoService.buscarPorSlug(slug);
    if (!org) {
      logger.warn("[publicAgendaController] Organização não encontrada", {
        slug,
      });
      return res
        .status(404)
        .json({ sucesso: false, erro: "Organização não encontrada." });
    }

    // 🔹 Busca eventos filtrando pela organização
    const eventos = await publicAgendaService.listarEventosPublicos(org.id);

    logger.info("[publicAgendaController] Eventos encontrados", {
      slug,
      organizacaoId: org.id,
      total: eventos.length,
    });

    return res.status(200).json({ sucesso: true, data: eventos });
  } catch (error) {
    logger.error("❌ Erro ao listar eventos públicos:", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno ao listar eventos públicos.",
    });
  }
}

async function buscarEventoPublicoPorId(req, res) {
  try {
    const { id } = req.params;
    const { slug } = req.query; // ✅ slug vem na query
    logger.debug("[publicAgendaController] Buscando evento público por ID", {
      id,
      slug,
    });

    // 🔹 1. Validar se a organização existe via slug
    const org = slug ? await organizacaoService.buscarPorSlug(slug) : null;
    if (!org) {
      logger.warn("[publicAgendaController] Organização não encontrada", {
        slug,
      });
      return res.status(404).json({
        sucesso: false,
        erro: "Organização não encontrada.",
      });
    }

    // 🔹 2. Buscar o evento e garantir que pertence à organização
    const evento = await publicAgendaService.buscarEventoPublicoPorId(
      id,
      org.id
    );
    if (!evento) {
      logger.warn(
        "[publicAgendaController] Evento não pertence à organização",
        {
          id,
          slug,
        }
      );
      return res.status(404).json({
        sucesso: false,
        erro: "Evento não encontrado ou não pertence à organização informada.",
      });
    }

    return res.status(200).json(evento);
  } catch (error) {
    logger.error("❌ Erro ao buscar evento público:", error);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro interno ao buscar evento público.",
    });
  }
}

module.exports = {
  listarEventosPublicos,
  buscarEventoPublicoPorId,
};

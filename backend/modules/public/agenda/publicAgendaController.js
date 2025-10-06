const logger = require("../../../utils/logger");
const publicAgendaService = require("./publicAgendaService");

async function listarEventosPublicos(req, res) {
  try {
    const eventos = await publicAgendaService.listarEventosPublicos();
    return res.status(200).json({ sucesso: true, data: eventos });
  } catch (error) {
    logger.error("❌ Erro ao listar eventos públicos:", error);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro interno ao listar eventos públicos." });
  }
}

async function buscarEventoPublicoPorId(req, res) {
  try {
    const { id } = req.params;
    const evento = await publicAgendaService.buscarEventoPublicoPorId(id);

    if (!evento) {
      return res
        .status(404)
        .json({ sucesso: false, erro: "Evento não encontrado ou não disponível para inscrição." });
    }

    return res.status(200).json(evento);
  } catch (error) {
    logger.error("❌ Erro ao buscar evento público:", error);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro interno ao buscar evento público." });
  }
}

module.exports = {
  listarEventosPublicos,
  buscarEventoPublicoPorId,
};

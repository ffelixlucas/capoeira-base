// modules/graduacoes/graduacoesController.js
const graduacoesService = require("./graduacoesService");
const { logger } = require("../../utils/logger");

async function getPorCategoria(req, res) {
  try {
    const categoriaId = req.params.categoriaId || req.query.categoria_id;
    logger.info("[graduacoesController] getPorCategoria chamado", { categoriaId });

    if (!categoriaId) {
      return res.status(400).json({ sucesso: false, erro: "Parâmetro categoria_id é obrigatório" });
    }

    const graduacoes = await graduacoesService.listarPorCategoria(categoriaId);
    return res.json({ sucesso: true, data: graduacoes });
  } catch (err) {
    logger.error("[graduacoesController] Erro em getPorCategoria:", err);
    return res.status(500).json({ sucesso: false, erro: "Erro ao buscar graduações" });
  }
}

async function getTodas(req, res) {
  try {
    logger.info("[graduacoesController] getTodas chamado");
    const graduacoes = await graduacoesService.listarTodas();
    return res.json({ sucesso: true, data: graduacoes });
  } catch (err) {
    logger.error("[graduacoesController] Erro em getTodas:", err);
    return res.status(500).json({ sucesso: false, erro: "Erro ao buscar graduações" });
  }
}


module.exports = { getPorCategoria, getTodas };

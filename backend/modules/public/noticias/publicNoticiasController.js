const logger = require("../../../utils/logger.js");
const publicNoticiasService = require("./publicNoticiasService");

async function listar(req, res) {
  try {
    const { slug } = req.params;
    const resultado = await publicNoticiasService.listarNoticiasPublicas(slug);

    return res.status(200).json({
      sucesso: true,
      data: resultado.noticias,
      organizacao_id: resultado.organizacaoId,
    });
  } catch (error) {
    logger.error("[publicNoticiasController] Erro ao listar notícias públicas", {
      message: error.message,
      stack: error.stack,
    });

    const status = error.statusCode || 500;
    return res.status(status).json({
      sucesso: false,
      erro: error.message || "Erro interno ao listar notícias públicas.",
    });
  }
}

module.exports = {
  listar,
};

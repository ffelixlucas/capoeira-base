const logger = require("../../../utils/logger.js");
const publicGaleriaService = require("./publicGaleriaService");

async function listar(req, res) {
  try {
    const { slug } = req.params;
    const resultado = await publicGaleriaService.listarGaleriaPublica(slug);

    return res.status(200).json({
      sucesso: true,
      data: resultado.imagens,
      organizacao_id: resultado.organizacaoId,
    });
  } catch (error) {
    logger.error("[publicGaleriaController] Erro ao listar galeria pública", {
      message: error.message,
      stack: error.stack,
    });

    const status = error.statusCode || 500;
    return res.status(status).json({
      sucesso: false,
      erro: error.message || "Erro interno ao listar galeria pública.",
    });
  }
}

module.exports = {
  listar,
};

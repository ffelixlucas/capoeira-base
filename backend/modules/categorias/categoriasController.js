// modules/categorias/categoriasController.js
const categoriasService = require("./categoriasService");
const { logger } = require("../../utils/logger");

async function getTodas(req, res) {
    try {
      logger.info("[categoriasController] getTodas chamado");
      const categorias = await categoriasService.listarTodas();
      return res.json({ sucesso: true, data: categorias });
    } catch (err) {
      logger.error("[categoriasController] Erro em getTodas:", err);
      return res.status(500).json({ sucesso: false, erro: "Erro ao buscar categorias" });
    }
  }
  
module.exports = { getTodas };

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
  
  async function getPorIdade(req, res) {
    try {
      const idade = parseInt(req.params.idade);
      logger.info(`[categoriasController] getPorIdade chamado com idade ${idade}`);
  
      const categoria = await categoriasService.buscarPorIdade(idade);
      if (!categoria) {
        return res.json({
          sucesso: true,
          mensagem: "Sem turma disponível para essa faixa etária",
          data: null,
        });
      }
  
      return res.json({ sucesso: true, data: categoria });
    } catch (err) {
      logger.error("[categoriasController] Erro em getPorIdade:", err);
      return res.status(500).json({
        sucesso: false,
        erro: "Erro ao buscar categoria por idade",
      });
    }
  }
  
  module.exports = { getTodas, getPorIdade };
  
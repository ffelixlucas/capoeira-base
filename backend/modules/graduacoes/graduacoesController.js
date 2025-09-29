// modules/graduacoes/graduacoesController.js
const graduacoesService = require("./graduacoesService.js");

async function getPorCategoria(req, res) {
  try {
    const categoria = req.params.categoria;
    const graduacoes = await graduacoesService.listarPorCategoria(categoria);
    return res.json(graduacoes);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar graduações" });
  }
}

async function getTodas(req, res) {
  try {
    const graduacoes = await graduacoesService.listarTodas();
    return res.json(graduacoes);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar graduações" });
  }
}

module.exports = { getPorCategoria, getTodas };

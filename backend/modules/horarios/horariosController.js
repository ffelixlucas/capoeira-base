const logger = require("../../utils/logger.js");
const horariosService = require("./horariosService");

// GET /api/horarios
async function listarHorarios(req, res) {
  try {
    const horarios = await horariosService.listarHorarios();
    res.json(horarios);
  } catch (err) {
    logger.error("Erro ao listar horários:", err);
    res.status(500).json({ erro: "Erro ao listar horários" });
  }
}

// GET /api/horarios/:id
async function obterHorario(req, res) {
  try {
    const id = req.params.id;
    const horario = await horariosService.obterHorarioPorId(id);
    if (!horario)
      return res.status(404).json({ erro: "Horário não encontrado" });
    res.json(horario);
  } catch (err) {
    logger.error("Erro ao obter horário:", err);
    res.status(500).json({ erro: "Erro ao obter horário" });
  }
}

// POST /api/horarios
async function criarHorario(req, res) {
  try {
    const novo = await horariosService.criarHorario(req.body);
    res.status(201).json({ id: novo });
  } catch (err) {
    logger.error("Erro ao criar horário:", err);
    res.status(400).json({ erro: err.message || "Erro ao criar horário" });
  }
}

// PUT /api/horarios/:id
async function atualizarHorario(req, res) {
  try {
    const id = req.params.id;
    await horariosService.atualizarHorario(id, req.body);
    res.status(204).end();
  } catch (err) {
    logger.error("Erro ao atualizar horário:", err);
    res.status(400).json({ erro: err.message || "Erro ao atualizar horário" });
  }
}

// DELETE /api/horarios/:id
async function excluirHorario(req, res) {
  try {
    const id = req.params.id;
    await horariosService.excluirHorario(id);
    res.status(204).end();
  } catch (err) {
    logger.error("Erro ao excluir horário:", err);
    res.status(400).json({ erro: err.message || "Erro ao excluir horário" });
  }
}

// PUT /api/horarios/atualizar-ordem
async function atualizarOrdem(req, res) {
  try {
    const lista = req.body;

    if (!Array.isArray(lista)) {
      return res
        .status(400)
        .json({ erro: "Formato inválido. Esperado um array de itens." });
    }

    await horariosService.atualizarOrdemHorarios(lista);
    res.json({ mensagem: "Ordem atualizada com sucesso" });
  } catch (err) {
    logger.error("Erro ao atualizar ordem:", err);
    res.status(500).json({ erro: "Erro ao atualizar ordem" });
  }
}

module.exports = {
  listarHorarios,
  obterHorario,
  criarHorario,
  atualizarHorario,
  excluirHorario,
  atualizarOrdem,
};

const inscricoesService = require('./inscricoesService');

const listarPorEvento = async (req, res) => {
  try {
    const inscritos = await inscricoesService.listarPorEvento(req.params.eventoId);
    return res.status(200).json({ sucesso: true, data: inscritos });
  } catch (error) {
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
};

const criarInscricao = async (req, res) => {
  try {
    const inscricao = await inscricoesService.criarInscricao(req.body);
    return res.status(201).json({ sucesso: true, data: inscricao });
  } catch (error) {
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
};

const webhookPagamento = async (req, res) => {
  try {
    const resultado = await inscricoesService.processarWebhook(req.body);
    return res.status(200).json({ sucesso: true, data: resultado });
  } catch (error) {
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
};


const buscarPorId = async (req, res) => {
  try {
    const inscrito = await inscricoesService.buscarPorId(req.params.id);
    if (!inscrito) {
      return res.status(404).json({ sucesso: false, erro: "Inscrição não encontrada" });
    }
    return res.status(200).json({ sucesso: true, data: inscrito });
  } catch (error) {
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
};

module.exports = {
  listarPorEvento,
  buscarPorId,
  criarInscricao,
  webhookPagamento
};



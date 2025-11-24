//backend/modules/inscricoes/inscricoesController.js
const logger = require("../../utils/logger.js");
const inscricoesService = require("./inscricoesService");

const listarPorEvento = async (req, res) => {
  try {
    const busca = req.query.busca || "";
    const categoria = req.query.categoria || "todos";
    const dados = await inscricoesService.listarPorEvento(
      req.params.eventoId,
      busca,
      categoria
    );

    // Caso o evento não exista
    if (!dados) {
      return res
        .status(404)
        .json({ sucesso: false, erro: "Evento não encontrado" });
    }

    // Agora retornamos a estrutura { evento, inscritos }
    return res.status(200).json({ sucesso: true, data: dados });
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
      return res
        .status(404)
        .json({ sucesso: false, erro: "Inscrição não encontrada" });
    }
    return res.status(200).json({ sucesso: true, data: inscrito });
  } catch (error) {
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
};

// NOVO: atualizar inscrição
const atualizarInscricao = async (req, res) => {
  try {
    const id = req.params.id;
    const dadosAtualizados = req.body;

    const inscricao = await inscricoesService.atualizarInscricao(
      id,
      dadosAtualizados
    );
    if (!inscricao) {
      return res
        .status(404)
        .json({ sucesso: false, erro: "Inscrição não encontrada" });
    }

    return res.status(200).json({ sucesso: true, data: inscricao });
  } catch (error) {
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
};

async function deletarInscricao(req, res) {
  try {
    const ok = await inscricoesService.deletarInscricao(req.params.id);
    if (!ok) return res.status(404).json({ error: "Inscrição não encontrada" });
    res.json({ message: "Inscrição deletada com sucesso" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erro ao deletar inscrição", details: err.message });
  }
}

async function extornarPagamento(req, res) {
  try {
    const { id } = req.params;
    const result = await inscricoesService.extornarPagamentoService(id);

    return res.status(200).json({
      sucesso: true,
      mensagem: "Pagamento extornado com sucesso",
      inscricao: result,
      debug: {
        refund_id: result.refund_id,
        refund_valor: result.refund_valor,
        status: result.status,
      },
    });
  } catch (error) {
    logger.error(
      "❌ Erro no controller extornarPagamento:",
      error?.response?.data || error
    );

    return res.status(500).json({
      sucesso: false,
      erro: error.message || "Falha ao extornar pagamento",
      debug: {
        detalhes: error?.response?.data || null,
      },
    });
  }
}

module.exports = {
  listarPorEvento,
  buscarPorId,
  criarInscricao,
  atualizarInscricao,
  webhookPagamento,
  deletarInscricao,
  extornarPagamento,
};

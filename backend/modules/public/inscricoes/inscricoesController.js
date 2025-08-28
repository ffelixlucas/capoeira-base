//backend/modules/public/inscricoes/inscricoesController.js
const {
  gerarPagamentoPixService,
  processarWebhookService,
  buscarInscricaoDetalhadaService,
  verificarInscricaoPaga,  
} = require("./inscricoesService");
const { enviarEmailConfirmacao } = require("../../../services/emailService");

const gerarPagamentoPix = async (req, res) => {
  try {
    const { cpf, evento_id } = req.body;

    const jaPago = await verificarInscricaoPaga(cpf, evento_id);
    if (jaPago) {
      return res.status(400).json({ error: "Inscrição já realizada e paga." });
    }

    const pagamento = await gerarPagamentoPixService(req.body);
    res.status(201).json(pagamento);
  } catch (error) {
    console.error(
      "Erro Controller gerarPagamentoPix:",
      error?.response?.data || error
    );
    res
      .status(500)
      .json({ error: error.message || "Erro ao gerar pagamento PIX" });
  }
};

const webhookPagamento = async (req, res) => {
  try {
    await processarWebhookService(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Erro Controller webhookPagamento:", error);
    res.sendStatus(500);
  }
};

const buscarInscricaoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const inscricao = await buscarInscricaoDetalhadaService(id);
    if (!inscricao)
      return res.status(404).json({ error: "Inscrição não encontrada" });
    res.json(inscricao);
  } catch (error) {
    console.error("Erro buscarInscricaoPorId:", error);
    res.status(500).json({ error: "Erro ao buscar inscrição" });
  }
};

const reenviarEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const inscricao = await buscarInscricaoDetalhadaService(id);

    if (!inscricao) {
      return res.status(404).json({ error: "Inscrição não encontrada" });
    }

    await enviarEmailConfirmacao(inscricao);
    res.json({
      ok: true,
      mensagem: `E-mail reenviado para ${inscricao.email}`,
    });
  } catch (error) {
    console.error("❌ Erro ao reenviar e-mail:", error);
    res.status(500).json({ error: "Falha ao reenviar e-mail" });
  }
};
module.exports = {
  gerarPagamentoPix,
  webhookPagamento,
  buscarInscricaoPorId,
  reenviarEmail,
  
};

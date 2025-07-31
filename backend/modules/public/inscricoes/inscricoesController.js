const { gerarPagamentoPixService, processarWebhookService } = require("./inscricoesService");

const gerarPagamentoPix = async (req, res) => {
  try {
    const pagamento = await gerarPagamentoPixService(req.body);
    res.status(201).json(pagamento);
  } catch (error) {
    console.error("Erro Controller gerarPagamentoPix:", error);
    res.status(500).json({ error: "Erro ao gerar pagamento PIX" });
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

module.exports = { gerarPagamentoPix, webhookPagamento };

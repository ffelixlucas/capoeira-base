// backend/modules/public/inscricoes/inscricoesController.js
const {
  gerarPagamentoPixService,
  gerarPagamentoCartaoService,
  processarWebhookService,
  buscarInscricaoDetalhadaService,
  verificarInscricaoPaga,
  calcularParcelasService,
} = require("./inscricoesService");
const { enviarEmailConfirmacao } = require("../../../services/emailService");
const {
  buscarPorId: buscarEventoPorId,
} = require("../../agenda/agendaRepository");
const { buscarInscricaoPendente } = require("./inscricoesRepository");
const logger = require("../../../utils/logger");

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
    logger.error(
      "Erro Controller gerarPagamentoPix:",
      error?.response?.data || error
    );

    res
      .status(500)
      .json({ error: error.message || "Erro ao gerar pagamento PIX" });
  }
};

const gerarPagamentoCartao = async (req, res) => {
  try {
    logger.log("🚀 [Controller] Iniciando pagamento Cartão:", {
      ...req.body,
      cpf: logger.mascararCpf(req.body.cpf),
      telefone: logger.mascararTelefone(req.body.telefone),
    });

    const { cpf, evento_id } = req.body;

    const jaPago = await verificarInscricaoPaga(cpf, evento_id);
    if (jaPago) {
      logger.warn("⚠️ Inscrição já paga via Cartão:", { cpf: logger.mascararCpf(cpf), evento_id });
      return res.status(400).json({ error: "Inscrição já realizada e paga." });
    }

    const pagamento = await gerarPagamentoCartaoService(req.body);
    logger.log("✅ [controller] Pagamento Cartão gerado:", pagamento);
    res.status(201).json(pagamento);
  } catch (error) {
    logger.error(
      "❌ [controller] Erro Controller gerarPagamentoCartao:",
      error
    );
    res
      .status(500)
      .json({ error: error.message || "Erro ao gerar pagamento Cartão" });
  }
};

const calcularParcelas = async (req, res) => {
  try {
    const { evento_id, bin, payment_method_id, issuer_id } = req.query;

    if (!evento_id) {
      return res.status(400).json({ error: "evento_id é obrigatório" });
    }

    // busca o valor do evento no banco
    const evento = await buscarEventoPorId(evento_id);
    if (!evento) {
      return res.status(404).json({ error: "Evento não encontrado" });
    }

    const valorEvento = parseFloat(evento.valor);
    if (isNaN(valorEvento) || valorEvento <= 0) {
      return res.status(400).json({ error: "Valor do evento inválido" });
    }

    // chama service com o valor do evento
    const parcelas = await calcularParcelasService({
      amount: valorEvento,
      bin,
      payment_method_id,
      issuer_id,
    });

    res.json(parcelas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const webhookPagamento = async (req, res) => {
  try {
    await processarWebhookService(req.body);
    return res.sendStatus(200);
  } catch (error) {
    logger.error("Erro Controller webhookPagamento:", error);
    return res.sendStatus(500);
  }
};

const buscarInscricaoPorId = async (req, res) => {
  logger.log("📌 [DEBUG] Chamou GET /public/inscricoes/:id", req.params);

  try {
    const { id } = req.params;
    logger.log("🔎 Buscando inscrição por id:", id);

    const inscricao = await buscarInscricaoDetalhadaService(id);

    if (!inscricao) {
      return res.status(404).json({ error: "Inscrição não encontrada" });
    }

    return res.json(inscricao);
  } catch (error) {
    logger.error("Erro buscarInscricaoPorId:", error);
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
    logger.error("❌ Erro ao reenviar e-mail:", error);

    res.status(500).json({ error: "Falha ao reenviar e-mail" });
  }
};

// Valida se o CPF já tem inscrição para o evento
const validarInscricao = async (req, res) => {
  try {
    const { cpf, evento_id } = req.query;
    logger.log("📌 [validarInscricao] chamado com:", { cpf: logger.mascararCpf(cpf), evento_id });

    if (!cpf || !evento_id) {
      logger.warn("⚠️ [validarInscricao] CPF ou evento_id faltando");
      return res
        .status(400)
        .json({ error: "CPF e evento_id são obrigatórios" });
    }

    const jaPago = await verificarInscricaoPaga(cpf, evento_id);
    logger.log("🔎 [validarInscricao] jáPago?", jaPago);

    if (jaPago) {
      return res.status(409).json({
        error: "Este CPF já possui inscrição confirmada neste evento.",
      });
    }

    const pendente = await buscarInscricaoPendente(cpf, evento_id);
    logger.log("🔎 [validarInscricao] pendente encontrado:", { id: pendente.id, status: pendente.status });

    if (pendente) {
      logger.log(
        "🔄 [validarInscricao] retornando inscrição pendente:",
        pendente.id
      );

      return res.json({
        status: "pendente",
        inscricao: pendente,
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    logger.error("❌ [validarInscricao] erro:", error);
    res.status(500).json({ error: "Erro ao validar inscrição" });
  }
};

module.exports = {
  gerarPagamentoPix,
  gerarPagamentoCartao,
  calcularParcelas,
  webhookPagamento,
  buscarInscricaoPorId,
  reenviarEmail,
  validarInscricao,
};

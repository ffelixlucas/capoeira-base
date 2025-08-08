const crypto = require("crypto");
const axios = require("axios");
const { MercadoPagoConfig, Payment } = require("mercadopago");
const {
  buscarInscricaoPendente,
  criarInscricaoPendente,
  atualizarInscricaoComPix,
  atualizarInscricaoParaPago,
  atualizarInscricaoPendente,
  buscarInscricaoComEvento,
  verificarInscricaoPaga,
} = require("./inscricoesRepository");
const { enviarEmailConfirmacao } = require("../../../services/emailService.js");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const payment = new Payment(client);

/**
 * Gera pagamento PIX no Mercado Pago ou retorna QR de inscrição pendente
 */
const gerarPagamentoPixService = async (dadosFormulario) => {
  const { cpf, nome, apelido, valor, evento_id } = dadosFormulario;

  // 🔒 Verifica se já tem uma inscrição paga para este CPF no mesmo evento
  const jaPago = await verificarInscricaoPaga(cpf, evento_id);
  if (jaPago) {
    throw new Error("Este CPF já possui inscrição confirmada neste evento.");
  }

  // 1️⃣ Verifica inscrição pendente pelo CPF
  const pendente = await buscarInscricaoPendente(cpf);
  if (pendente) {
    // 🛠️ Atualiza dados básicos (camiseta, responsável, etc.)
    await atualizarInscricaoPendente(pendente.id, dadosFormulario);

    const codigo_inscricao = gerarCodigoInscricao(pendente.id, evento_id);

    return {
      id: pendente.id,
      ticket_url: pendente.ticket_url,
      qr_code_base64: pendente.qr_code_base64,
      qr_code: pendente.qr_code,
      valor: pendente.valor,
      pagamento_id: pendente.pagamento_id,
      status: "pendente",
      date_of_expiration: pendente.date_of_expiration,
      codigo_inscricao,
    };
  }

  // 2️⃣ Cria inscrição pendente no banco
  const inscricaoId = await criarInscricaoPendente(dadosFormulario);

  const codigo_inscricao = gerarCodigoInscricao(inscricaoId, evento_id);

  // 3️⃣ Gera PIX no Mercado Pago
  const body = {
    transaction_amount: parseFloat(valor),
    description: `Inscrição ${nome}${apelido ? ` (${apelido})` : ""}`,
    payment_method_id: "pix",
    payer: {
      email: dadosFormulario.email,
      first_name: nome,
      identification: {
        type: "CPF",
        number: cpf.replace(/\D/g, ""),
      },
    },
    notification_url: `${process.env.SERVER_URL}/api/public/inscricoes/webhook`,
    external_reference: `${inscricaoId}`, // agora usamos o ID da inscrição
  };

  const result = await payment.create({
    body,
    requestOptions: { idempotencyKey: crypto.randomUUID() },
  });

  // 4️⃣ Extrai dados do PIX
  const qrCode = result.point_of_interaction.transaction_data.qr_code_base64;
  const ticketUrl = result.point_of_interaction.transaction_data.ticket_url;
  const expirationDate = result.date_of_expiration;

  // 5️⃣ Atualiza a inscrição com dados do PIX e a data de expiração
  await atualizarInscricaoComPix(inscricaoId, {
    pagamento_id: result.id,
    ticket_url: ticketUrl,
    qr_code_base64: qrCode,
    qr_code: result.point_of_interaction.transaction_data.qr_code,
    date_of_expiration: expirationDate,
    valor: result.transaction_amount,
  });

  // 6️⃣ Retorna dados para o frontend
  return {
    id: inscricaoId,
    ticket_url: ticketUrl,
    qr_code_base64: qrCode,
    qr_code: result.point_of_interaction.transaction_data.qr_code, // <- este estava faltando
    valor: result.transaction_amount,
    pagamento_id: result.id,
    status: "pendente",
    date_of_expiration: expirationDate,
    codigo_inscricao,
  };
};


const processarWebhookService = async (payload) => {
  if (payload?.type !== "payment") return;

  try {
    const paymentId = payload.data.id;

    const { data: pagamento } = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` } }
    );

    if (pagamento.status !== "approved") return;

    const inscricaoId = Number(pagamento.external_reference); // foi salvo como string no create
    const bruto = Number(pagamento.transaction_amount); // valor cobrado
    const liquido = Number(pagamento.transaction_details?.net_received_amount || 0);
    const taxa_valor = Math.max(0, bruto - liquido);
    const taxa_percentual = bruto > 0 ? Number(((taxa_valor / bruto) * 100).toFixed(2)) : 0;

    // Atualiza a inscrição com bruto + líquido + taxas (uma única query)
    await atualizarInscricaoParaPago(inscricaoId, {
      status: "pago",
      pagamento_id: pagamento.id,
      valor_bruto: bruto,
      valor_liquido: liquido,
      taxa_valor,
      taxa_percentual,
    });

    // Envia e-mail de confirmação
    const inscricao = await buscarInscricaoDetalhadaService(inscricaoId);
    if (inscricao) {
      await enviarEmailConfirmacao(inscricao);
    }
  } catch (err) {
    console.error("Erro no webhook do Mercado Pago:", err?.response?.data || err);
  }
};


const buscarInscricaoDetalhadaService = async (id) => {
  const inscricao = await buscarInscricaoComEvento(id);
  if (!inscricao) return null;

  const codigo_inscricao = gerarCodigoInscricao(
    inscricao.id,
    inscricao.evento_id
  );

  return {
    status: inscricao.status,
    nome: inscricao.nome,
    codigo_inscricao,
    evento: {
      titulo: inscricao.titulo,
      data: inscricao.data,
      local: inscricao.local,
      possui_camiseta: inscricao.possui_camiseta,
    },
  };
};

module.exports = {
  gerarPagamentoPixService,
  processarWebhookService,
  buscarInscricaoDetalhadaService,
  verificarInscricaoPaga,
};

function gerarCodigoInscricao(idInscricao, idEvento) {
  const anoAtual = new Date().getFullYear();
  return `GCB-${anoAtual}-EVT${idEvento}-${idInscricao
    .toString()
    .padStart(4, "0")}`;
}

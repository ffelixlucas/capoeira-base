const crypto = require("crypto");
const axios = require("axios");
const { MercadoPagoConfig, Payment } = require("mercadopago");
const {
  buscarInscricaoPendente,
  criarInscricaoPendente,
  atualizarInscricaoComPix,
  atualizarInscricaoParaPago,
  atualizarInscricaoPendente,
} = require("./inscricoesRepository");

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

  // 1️⃣ Verifica inscrição pendente pelo CPF
  const pendente = await buscarInscricaoPendente(cpf);
  if (pendente) {
    // 🛠️ Atualiza dados básicos (camiseta, responsável, etc.)
    await atualizarInscricaoPendente(pendente.id, dadosFormulario);
  
    return {
      ticket_url: pendente.ticket_url,
      qr_code_base64: pendente.qr_code_base64,
      qr_code: pendente.qr_code,
      valor: pendente.valor,
      pagamento_id: pendente.pagamento_id,
      status: "pendente",
      date_of_expiration: pendente.date_of_expiration,
    };
  }
  

  // 2️⃣ Cria inscrição pendente no banco
  const inscricaoId = await criarInscricaoPendente(dadosFormulario);

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
    qr_code:result.point_of_interaction.transaction_data.qr_code, 
    date_of_expiration: expirationDate,
    valor: result.transaction_amount,
  });
  

  // 6️⃣ Retorna dados para o frontend
  return {
    ticket_url: ticketUrl,
    qr_code_base64: qrCode,
    qr_code: result.point_of_interaction.transaction_data.qr_code, // <- este estava faltando
    valor: result.transaction_amount,
    pagamento_id: result.id,
    status: "pendente",
    date_of_expiration: expirationDate,
  };
};

/**
 * Processa o webhook do Mercado Pago
 */
const processarWebhookService = async (payload) => {
  if (payload.type !== "payment") return;

  const paymentId = payload.data.id;

  const response = await axios.get(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
    }
  );

  const pagamento = response.data;

  // 7️⃣ Se o pagamento foi aprovado → atualiza inscrição para pago
  if (pagamento.status === "approved") {
    const inscricaoId = pagamento.external_reference;
    await atualizarInscricaoParaPago(inscricaoId, pagamento.transaction_amount);
  }
};

module.exports = { gerarPagamentoPixService, processarWebhookService };

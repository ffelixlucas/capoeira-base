// backend/modules/public/inscricoes/inscricoesService.js
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
const {
  enviarEmailConfirmacao,
} = require("../../services/emailService.js");
const { registrarLogTransacao } = require("./logsRepository");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const payment = new Payment(client);

/**
 * Validações
 */
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0,
    resto;

  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validarTelefone(telefone) {
  const digits = telefone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

/**
 * Gera pagamento PIX
 */
const gerarPagamentoPixService = async (dadosFormulario) => {
  const { cpf, responsavel_documento, nome, apelido, valor, evento_id } =
    dadosFormulario;

  if (!validarCPF(cpf)) throw new Error("CPF do inscrito inválido.");
  if (responsavel_documento && !validarCPF(responsavel_documento))
    throw new Error("CPF do responsável inválido.");
  if (!validarEmail(dadosFormulario.email))
    throw new Error("E-mail inválido.");
  if (!validarTelefone(dadosFormulario.telefone))
    throw new Error("Telefone inválido.");
  if (!valor || parseFloat(valor) <= 0)
    throw new Error("Valor da inscrição inválido.");

  const jaPago = await verificarInscricaoPaga(cpf, evento_id);
  if (jaPago) {
    throw new Error("Este CPF já possui inscrição confirmada neste evento.");
  }

  const pendente = await buscarInscricaoPendente(cpf);
  if (pendente) {
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

  const inscricaoId = await criarInscricaoPendente(dadosFormulario);
  const codigo_inscricao = gerarCodigoInscricao(inscricaoId, evento_id);

  const documentoCPF = dadosFormulario.responsavel_documento
    ? dadosFormulario.responsavel_documento.replace(/\D/g, "")
    : cpf.replace(/\D/g, "");

  const nomePagador = dadosFormulario.responsavel_nome || nome;
  const emailPagador =
    dadosFormulario.responsavel_email || dadosFormulario.email;

  const baseUrl = process.env.SERVER_URL.endsWith("/api")
    ? process.env.SERVER_URL
    : `${process.env.SERVER_URL}/api`;

  const body = {
    transaction_amount: parseFloat(valor),
    description: `Inscrição ${nome}${apelido ? ` (${apelido})` : ""}`,
    payment_method_id: "pix",
    payer: {
      email: emailPagador,
      first_name: nomePagador,
      identification: {
        type: "CPF",
        number: documentoCPF,
      },
    },
    notification_url: `${baseUrl}/public/inscricoes/webhook`,
    external_reference: `${inscricaoId}`,
  };

  const result = await payment.create({
    body,
    requestOptions: { idempotencyKey: crypto.randomUUID() },
  });

  const qrCode = result.point_of_interaction.transaction_data.qr_code_base64;
  const ticketUrl = result.point_of_interaction.transaction_data.ticket_url;
  const expirationDate = result.date_of_expiration;

  await atualizarInscricaoComPix(inscricaoId, {
    pagamento_id: result.id,
    ticket_url: ticketUrl,
    qr_code_base64: qrCode,
    qr_code: result.point_of_interaction.transaction_data.qr_code,
    date_of_expiration: expirationDate,
    valor: result.transaction_amount,
  });

  return {
    id: inscricaoId,
    ticket_url: ticketUrl,
    qr_code_base64: qrCode,
    qr_code: result.point_of_interaction.transaction_data.qr_code,
    valor: result.transaction_amount,
    pagamento_id: result.id,
    status: "pendente",
    date_of_expiration: expirationDate,
    codigo_inscricao,
  };
};

/**
 * Processa Webhook Mercado Pago
 */
const processarWebhookService = async (payload) => {
  if (payload?.type !== "payment") return;

  try {
    const paymentId = payload.data.id;

    const { data: pagamento } = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (pagamento.status !== "approved") return;

    const inscricaoId = Number(pagamento.external_reference);
    const bruto = Number(pagamento.transaction_amount);
    const liquido = Number(
      pagamento.transaction_details?.net_received_amount || 0
    );
    const taxa_valor = Math.max(0, bruto - liquido);
    const taxa_percentual =
      bruto > 0 ? Number(((taxa_valor / bruto) * 100).toFixed(2)) : 0;

    await atualizarInscricaoParaPago(inscricaoId, {
      status: "pago",
      pagamento_id: pagamento.id,
      valor_bruto: bruto,
      valor_liquido: liquido,
      taxa_valor,
      taxa_percentual,
    });
    console.log("🚀 Webhook recebido para pagamento:", paymentId);

    // ✅ Log de pagamento aprovado
    await registrarLogTransacao(inscricaoId, "pagamento_aprovado", "sucesso", pagamento);

    const inscricao = await buscarInscricaoDetalhadaService(inscricaoId);
    if (inscricao?.email && inscricao.email.includes("@")) {
      try {
        await enviarEmailConfirmacao(inscricao);
        console.log("✅ E-mail enviado com sucesso para:", inscricao.email);
      } catch (err) {
        console.error("❌ Erro ao enviar e-mail:", err.message || err);
      }
    }
  } catch (err) {
    console.error("Erro no webhook do Mercado Pago:", err?.response?.data || err);

    // ❌ Log de erro de pagamento
    const inscricaoId = payload?.data?.id ? Number(payload.data.id) : null;
    if (inscricaoId) {
      try {
        await registrarLogTransacao(
          inscricaoId,
          "erro_pagamento",
          "erro",
          err?.response?.data || { message: err.message }
        );
      } catch (errLog) {
        console.error("⚠️ Falha ao registrar log de erro de pagamento:", errLog.message);
      }
    }
  }
};

/**
 * Busca inscrição detalhada
 */
const buscarInscricaoDetalhadaService = async (id) => {
  const inscricao = await buscarInscricaoComEvento(id);
  if (!inscricao) return null;

  const codigo_inscricao = gerarCodigoInscricao(inscricao.id, inscricao.evento_id);

  return {
    id: inscricao.id,
    status: inscricao.status,
    nome: inscricao.nome,
    apelido: inscricao.apelido,
    email: inscricao.email,
    telefone: inscricao.telefone,
    cpf: inscricao.cpf,
    data_nascimento: inscricao.data_nascimento,
    camiseta_tamanho: inscricao.tamanho_camiseta,
    restricoes: inscricao.alergias_restricoes,
    categoria: inscricao.categoria,
    graduacao: inscricao.graduacao,
    codigo_inscricao,
    evento: {
      titulo: inscricao.titulo,
      descricao_curta: inscricao.descricao_curta,
      descricao_completa: inscricao.descricao_completa,
      data_inicio: inscricao.data_inicio,
      data_fim: inscricao.data_fim,
      local: inscricao.local,
      endereco: inscricao.endereco,
      telefone_contato: inscricao.telefone_contato,
      valor: inscricao.valor,
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

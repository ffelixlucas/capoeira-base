//backend/modules/public/inscricoes/inscricoesService.js
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
  enviarEmailExtorno,
} = require("../../../services/emailService.js");
const logger = require("../../../utils/logger.js");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

const payment = new Payment(client);

/**
 * Gera pagamento PIX no Mercado Pago ou retorna QR de inscrição pendente
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
  // Regex simples que cobre a maioria dos casos
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validarTelefone(telefone) {
  const digits = telefone.replace(/\D/g, "");
  // Aceita fixo (10 dígitos) ou celular (11 dígitos)
  return digits.length >= 10 && digits.length <= 11;
}

const gerarPagamentoPixService = async (dadosFormulario) => {
  const { cpf, responsavel_documento, nome, apelido, valor, evento_id } =
    dadosFormulario;

  // 🔒 Validar CPF do inscrito
  if (!validarCPF(cpf)) {
    throw new Error("CPF do inscrito inválido.");
  }

  // 🔒 Validar CPF do responsável, se informado
  if (responsavel_documento && !validarCPF(responsavel_documento)) {
    throw new Error("CPF do responsável inválido.");
  }

  // 🔒 Validar e-mail
  if (!validarEmail(dadosFormulario.email)) {
    throw new Error("E-mail inválido.");
  }

  // 🔒 Validar telefone
  if (!validarTelefone(dadosFormulario.telefone)) {
    throw new Error("Telefone inválido.");
  }

  // 🔒 Validar valor
  const valorNum = parseFloat(
    dadosFormulario.total_amount || dadosFormulario.valor
  );
  if (isNaN(valorNum) || valorNum <= 0) {
    throw new Error("Valor da inscrição inválido.");
  }

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

  // 🔒 Se menor de idade, usa dados do responsável como pagador
  const documentoCPF = dadosFormulario.responsavel_documento
    ? dadosFormulario.responsavel_documento.replace(/\D/g, "")
    : cpf.replace(/\D/g, "");

  const nomePagador = dadosFormulario.responsavel_nome || nome;
  const emailPagador =
    dadosFormulario.responsavel_email || dadosFormulario.email;

  // 🔒 Garante que não duplique o /api
  const baseUrl = process.env.SERVER_URL.endsWith("/api")
    ? process.env.SERVER_URL
    : `${process.env.SERVER_URL}/api`;

  const apelidoNormalizado = apelido || "";

  const body = {
    transaction_amount: valorNum,
    description: `Inscrição ${nome}${apelidoNormalizado ? ` (${apelidoNormalizado})` : ""}`,
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

// Gera pagamento com cartão de crédito no Mercado Pago

const gerarPagamentoCartaoService = async (dadosFormulario) => {
  try {
    const {
      token,
      payment_method_id,
      installments = 1,
      issuer_id,
      cpf,
      responsavel_documento,
      nome,
      apelido,
      email,
      telefone,
      valor,
      evento_id,
      responsavel_nome,
      responsavel_email,
    } = dadosFormulario;
    logger.log("📦 [Cartão] Body recebido:", dadosFormulario);

    logger.log("🟢 [Cartão] Iniciando geração de pagamento:", {
      evento_id: dadosFormulario.evento_id,
      cpf: dadosFormulario.cpf,
      total_amount: dadosFormulario.total_amount,
      valor: dadosFormulario.valor,
      installments: dadosFormulario.installments,
      payment_method_id: dadosFormulario.payment_method_id,
    });

    if (!token) throw new Error("Token do cartão ausente.");
    if (!payment_method_id)
      throw new Error("Bandeira do cartão não informada.");
    // 🔒 Validar valor
    const valorNum = parseFloat(dadosFormulario.total_amount);
    if (isNaN(valorNum) || valorNum <= 0) {
      throw new Error("Valor da inscrição inválido.");
    }

    // 🔒 Validar parcelas
    const parcelasNum = parseInt(installments, 10);
    if (isNaN(parcelasNum) || parcelasNum <= 0) {
      throw new Error("Número de parcelas inválido.");
    }

    // 🔒 Normalizar issuer_id
    const issuer = issuer_id && issuer_id !== "" ? issuer_id : null;

    const jaPago = await verificarInscricaoPaga(cpf, evento_id);
    if (jaPago) {
      throw new Error("Este CPF já possui inscrição confirmada neste evento.");
    }

    // 🔄 Inscrição pendente
    let inscricaoId;
    const pendente = await buscarInscricaoPendente(cpf);
    if (pendente) {
      await atualizarInscricaoPendente(pendente.id, dadosFormulario);
      inscricaoId = pendente.id;
      logger.log("🔄 [Cartão] Atualizada inscrição pendente:", inscricaoId);
    } else {
      inscricaoId = await criarInscricaoPendente(dadosFormulario);
      logger.log("🆕 [Cartão] Criada nova inscrição pendente:", inscricaoId);
    }

    const codigo_inscricao = gerarCodigoInscricao(inscricaoId, evento_id);

    const documentoCPF = responsavel_documento
      ? responsavel_documento.replace(/\D/g, "")
      : cpf.replace(/\D/g, "");
    const nomePagador = responsavel_nome || nome;
    const emailPagador = responsavel_email || email;

    const baseUrl = process.env.SERVER_URL.endsWith("/api")
      ? process.env.SERVER_URL
      : `${process.env.SERVER_URL}/api`;

    const body = {
      transaction_amount: valorNum, // ✅ usa o valor já validado
      token,
      description: `Inscrição ${nome}${apelido ? ` (${apelido})` : ""}`,
      installments: parcelasNum,
      payment_method_id,
      issuer_id: issuer,
      capture: true,
      payer: {
        email: emailPagador,
        first_name: nomePagador,
        identification: { type: "CPF", number: documentoCPF },
      },
      additional_info: {
        items: [
          {
            id: `${evento_id}`,
            title: `Inscrição evento ${evento_id}`,
            description: `Inscrição ${nome}${apelido ? ` (${apelido})` : ""}`,
            quantity: 1,
            unit_price: valorNum,
          },
        ],
        payer: {
          first_name: nomePagador,
          last_name: "",
          phone: { number: telefone },
          address: {
            zip_code: "",
            street_name: "",
            street_number: "",
          },
        },
      },
      notification_url: `${baseUrl}/public/inscricoes/webhook`,
      external_reference: `${inscricaoId}`,
      statement_descriptor: "CAPOEIRA BASE",
    };

    logger.log("📦 [Cartão] Body enviado ao MP:", body);

    const result = await payment.create({
      body,
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    });

    logger.log("✅ [Cartão] Resposta MP:", {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
    });

    return {
      id: inscricaoId,
      pagamento_id: result.id,
      status: result.status,
      status_detail: result.status_detail,
      installments: result.installments,
      payment_method_id: result.payment_method_id,
      codigo_inscricao,
    };
  } catch (err) {
    logger.error("❌ [Cartão] Erro gerarPagamentoCartaoService:", err);
    throw err;
  }
};

// mapeia o payload do MP em uma lista simples
function mapPayerCosts(data) {
  const arr = Array.isArray(data) ? data : [];
  const costs = arr[0]?.payer_costs || [];
  return costs
    .filter((p) => p?.installments > 0)
    .map((p) => ({
      installments: p.installments,
      installment_amount: p.installment_amount,
      total_amount: p.total_amount,
      recommended_message: p.recommended_message,
    }));
}

async function fetchInstallments({
  amount,
  bin = null,
  payment_method_id = null,
  issuer_id = null,
}) {
  const url = new URL(
    "https://api.mercadopago.com/v1/payment_methods/installments"
  );
  url.searchParams.append("amount", amount);
  if (bin) url.searchParams.append("bin", String(bin));
  if (payment_method_id)
    url.searchParams.append("payment_method_id", payment_method_id);
  if (issuer_id) url.searchParams.append("issuer.id", issuer_id);

  const { data } = await axios.get(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
    },
    timeout: 8000,
  });
  return mapPayerCosts(data);
}

const calcularParcelasService = async ({
  amount,
  payment_method_id = null,
  issuer_id = null,
  bin = null,
}) => {
  try {
    // 1) tenta com BIN puro
    let lista = await fetchInstallments({
      amount,
      bin,
      payment_method_id,
      issuer_id,
    });

    // 2) fallback: se veio vazio, força VISA
    if (!lista.length) {
      lista = await fetchInstallments({
        amount,
        bin,
        payment_method_id: "visa",
        issuer_id: null,
      });
    }

    // 3) fallback final: se ainda vazio, força MASTER
    if (!lista.length) {
      lista = await fetchInstallments({
        amount,
        bin,
        payment_method_id: "master",
        issuer_id: null,
      });
    }

    return lista;
  } catch (err) {
    // mantém o comportamento de não derrubar o fluxo
    console.error(
      "❌ Erro Service calcularParcelasService:",
      err?.response?.data || err?.message || err
    );
    throw new Error("Falha ao consultar parcelas no Mercado Pago");
  }
};

// Processa webhook do Mercado Pago

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

    if (pagamento.status !== "approved") {
      logger.warn("⚠️ Pagamento não aprovado:", {
        id: pagamento.id,
        status: pagamento.status,
        detail: pagamento.status_detail,
      });
      return;
    }

    const inscricaoId = Number(pagamento.external_reference); // foi salvo como string no create
    const bruto = Number(pagamento.transaction_amount); // valor cobrado
    const liquido = Number(
      pagamento.transaction_details?.net_received_amount || 0
    );
    const taxa_valor = Math.max(0, bruto - liquido);
    const taxa_percentual =
      bruto > 0 ? Number(((taxa_valor / bruto) * 100).toFixed(2)) : 0;

    // Atualiza a inscrição com bruto + líquido + taxas (uma única query)
    await atualizarInscricaoParaPago(inscricaoId, {
      status: "pago",
      pagamento_id: pagamento.id,
      valor_bruto: bruto,
      valor_liquido: liquido,
      taxa_valor,
      taxa_percentual,
      metodo_pagamento: pagamento.payment_method_id,
      parcelas: pagamento.installments,
    });

    logger.log("🚀 Webhook recebido para pagamento:", paymentId);

    // Envia e-mail de confirmação
    const inscricao = await buscarInscricaoDetalhadaService(inscricaoId);
    logger.log("📌 Inscrição detalhada:", inscricao);

    if (inscricao) {
      if (inscricao.email && inscricao.email.includes("@")) {
        try {
          await enviarEmailConfirmacao(inscricao);
          logger.log("✅ E-mail enviado com sucesso para:", inscricao.email);
        } catch (err) {
          logger.error("❌ Erro ao enviar e-mail:", err.message || err);
        }
      } else {
        logger.warn(
          "⚠️ Inscrição sem e-mail válido, não foi possível enviar:",
          inscricao
        );
      }
    }
  } catch (err) {
    logger.error(
      "Erro no webhook do Mercado Pago:",
      err?.response?.data || err
    );
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
  gerarPagamentoCartaoService,
  calcularParcelasService,
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

//backend/modules/public/inscricoes/inscricoesService.js
const crypto = require("crypto");
const axios = require("axios");
const { MercadoPagoConfig, Payment } = require("mercadopago");
const inscricoesRepository = require("./inscricoesRepository");

const {
  buscarInscricaoPendente,
  criarInscricaoPendente,
  atualizarInscricaoComPix,
  atualizarInscricaoParaPago,
  atualizarInscricaoPendente,
  buscarInscricaoComEvento,
  verificarInscricaoPaga,
  buscarValorEvento,
  verificarEncerramentoInscricao,
  verificarLimiteInscritos,
} = require("./inscricoesRepository");
const {
  enviarEmailConfirmacao,
  enviarEmailPendente,
} = require("../../../services/emailService.js");
const logger = require("../../../utils/logger.js");


const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  options: { timeout: 8000 },
});

const payment = new Payment(client);

const TAXA_CARTAO = 0.0499;

function arredondarValor(valor) {
  return Number(Number(valor || 0).toFixed(2));
}

function calcularValorComTaxa(valorBase, metodoPagamento) {
  const base = Number(valorBase);
  if (!Number.isFinite(base) || base <= 0) return 0;

  if (metodoPagamento === "cartao") {
    return arredondarValor(base / (1 - TAXA_CARTAO));
  }

  // Pix e boleto seguem o valor base atual.
  return arredondarValor(base);
}

function calcularValores(valorBase) {
  const base = Number(valorBase);
  if (!Number.isFinite(base) || base <= 0) {
    throw new Error("Valor do evento inválido.");
  }

  return {
    pix: arredondarValor(base),
    cartao: calcularValorComTaxa(base, "cartao"),
    boleto: calcularValorComTaxa(base, "boleto"),
  };
}

function mapearStatusMP(status) {
  switch (status) {
    case "approved":
      return "pago";
    case "refunded":
      return "extornado"; // devolvido
    case "rejected":
      return "rejeitado"; // nunca foi pago
    case "pending":
    default:
      return "pendente";
  }
}

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

  // ⛔ Bloqueio de inscrições após data limite
  const encerrado = await verificarEncerramentoInscricao(evento_id);
  if (encerrado) {
    throw new Error("As inscrições para este evento estão encerradas.");
  }

  const limiteAtingido = await verificarLimiteInscritos(evento_id);
  if (limiteAtingido) {
    throw new Error("Limite de inscritos atingido para este evento.");
  }

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
  const pendente = await buscarInscricaoPendente(cpf, evento_id);
  let inscricaoId; // ✅ UMA variável só

  if (pendente) {
    await atualizarInscricaoPendente(pendente.id, dadosFormulario);

    const temQr = !!(pendente.qr_code && pendente.ticket_url);
    if (temQr) {
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

    // pendente sem QR → gerar PIX no MESMO registro
    inscricaoId = pendente.id;
  } else {
    // não havia pendente → cria agora
    inscricaoId = await criarInscricaoPendente(dadosFormulario);
  }

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
    metodo_pagamento: "pix",
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
    logger.log("➡️ [Service] Dados recebidos:", {
      ...dadosFormulario,
      cpf: logger.mascararCpf(dadosFormulario.cpf),
      telefone: logger.mascararTelefone(dadosFormulario.telefone),
    });

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
    // ⛔ Bloqueio de inscrições após data limite
    const encerrado = await verificarEncerramentoInscricao(evento_id);
    if (encerrado) {
      throw new Error("As inscrições para este evento estão encerradas.");
    }

    const limiteAtingido = await verificarLimiteInscritos(evento_id);
    if (limiteAtingido) {
      throw new Error("Limite de inscritos atingido para este evento.");
    }

    if (!token) throw new Error("Token do cartão ausente.");
    if (!payment_method_id)
      throw new Error("Bandeira do cartão não informada.");

    // 🔒 Validar valor
    let valorNum = parseFloat(dadosFormulario.total_amount || valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      throw new Error("Valor da inscrição inválido.");
    }

    // ✅ Aplica taxa se for cartão
    valorNum = calcularValorComTaxa(valorNum, "cartao");

    // 🔒 Validar parcelas
    const parcelasNum = parseInt(installments, 10);
    if (isNaN(parcelasNum) || parcelasNum <= 0) {
      throw new Error("Número de parcelas inválido.");
    }

    // 🔒 Verificar se já existe inscrição paga
    const jaPago = await verificarInscricaoPaga(cpf, evento_id);
    if (jaPago) {
      throw new Error("Este CPF já possui inscrição confirmada neste evento.");
    }

    // 🔒 Normalizar dados do pagador
    const documentoCPF = responsavel_documento
      ? responsavel_documento.replace(/\D/g, "")
      : cpf.replace(/\D/g, "");
    const nomePagador = responsavel_nome || nome;
    const emailPagador = responsavel_email || email;

    const baseUrl = process.env.SERVER_URL.endsWith("/api")
      ? process.env.SERVER_URL
      : `${process.env.SERVER_URL}/api`;

    // ✅ garantir inscrição e atualizar dados ANTES do pagamento
    let inscricaoId;
    const pendenteAtual = await buscarInscricaoPendente(cpf, evento_id);
    if (pendenteAtual) {
      await atualizarInscricaoPendente(pendenteAtual.id, dadosFormulario);
      inscricaoId = pendenteAtual.id;
    } else {
      inscricaoId = await criarInscricaoPendente({
        ...dadosFormulario,
        status: "pendente",
        metodo_pagamento: "cartao",
      });
    }

    const body = {
      transaction_amount: valorNum,
      token,
      description: `Inscrição ${nome}${apelido ? ` (${apelido})` : ""}`,
      installments: parcelasNum,
      payment_method_id,
      issuer_id: issuer_id || null,
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
          address: { zip_code: "", street_name: "", street_number: "" },
        },
      },
      notification_url: `${baseUrl}/public/inscricoes/webhook`,
      external_reference: inscricaoId.toString(), // 🔥 chave para o webhook achar sua inscrição
      statement_descriptor: "CAPOEIRA BASE",
    };

    const safeBodyForLog = { ...body, token: "***" };
    logger.log("📦 [Cartão] Body enviado ao MP:", safeBodyForLog);

    const result = await payment.create({
      body,
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    });

    logger.log("📦 [Cartão] Resposta MP:", {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
    });

    // -------------------------------
    // 📌 Decisão baseada no status
    // -------------------------------
    // Se aprovado -> marcar como pago e retornar inscrição completa (com evento)
    if (result.status === "approved") {
      // 👉 usar o update de "pago", não o "pendente"
      // pega o valor base do evento (sem taxa)
      const valorBase = parseFloat(dadosFormulario.valor);

      // valor bruto já vem com taxa do MP
      const valorBruto = result.transaction_amount;

      // calcula taxas
      const taxa_valor = valorBruto - valorBase;
      const taxa_percentual =
        valorBase > 0 ? ((taxa_valor / valorBase) * 100).toFixed(2) : 0;

      await atualizarInscricaoParaPago(inscricaoId, {
        pagamento_id: result.id,
        status: "pago",
        metodo_pagamento: "cartao",
        bandeira_cartao: result.payment_method_id,
        parcelas: result.installments,
        valor_bruto: valorBruto,
        valor_liquido: valorBase,
        taxa_valor,
        taxa_percentual,
        ticket_url: null,
        qr_code: null,
        qr_code_base64: null,
        date_of_expiration: null,
      });

      // retorna a inscrição DETALHADA (inclui evento, código, valores)
      const inscricaoCompleta =
        await buscarInscricaoDetalhadaService(inscricaoId);

      return inscricaoCompleta;
    }

    // Se pendente (CONT, CALL) -> mantém a MESMA inscrição como pendente
    if (result.status === "in_process" || result.status === "pending") {
      await atualizarInscricaoPendente(inscricaoId, {
        ...dadosFormulario,
        pagamento_id: result.id,
        status: "pendente",
      });

      return {
        id: inscricaoId,
        pagamento_id: result.id,
        status: "pendente",
        status_detail: result.status_detail,
      };
    }

    // Se rejeitado definitivo (FUND, SECU, EXPI, ORM...) -> não cria nada
    if (result.status === "rejected") {
      throw new Error("Pagamento rejeitado: " + result.status_detail);
    }

    // Qualquer outro caso inesperado
    throw new Error("Status de pagamento não reconhecido: " + result.status);
  } catch (err) {
    logger.error("❌ [Service] Erro gerarPagamentoCartaoService:", err);
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

    const inscricaoId = Number(pagamento.external_reference);
    const bruto = Number(pagamento.transaction_amount); // valor cobrado
    const liquido = Number(
      pagamento.transaction_details?.net_received_amount || 0
    );
    const taxa_valor = Math.max(0, bruto - liquido);
    const taxa_percentual =
      bruto > 0 ? Number(((taxa_valor / bruto) * 100).toFixed(2)) : 0;

    // Identifica se é PIX ou Cartão
    const isPix = pagamento.payment_method_id === "pix";

    // (você já calculou bruto, liquido, taxa_valor e taxa_percentual acima)

    // Monta o payload de atualização
    const updatePayload = {
      pagamento_id: pagamento.id,
      status: mapearStatusMP(pagamento.status),
      metodo_pagamento: isPix ? "pix" : "cartao",
      bandeira_cartao: isPix ? null : pagamento.payment_method_id, // só cartão tem bandeira
      parcelas: isPix ? 1 : pagamento.installments,
      valor_bruto: pagamento.transaction_amount,
      valor_liquido: pagamento.transaction_details?.net_received_amount ?? 0,
      taxa_valor: pagamento.fee_details?.[0]?.amount || 0,
      taxa_percentual, // usa o que você já calculou acima
    };

    // 🧹 Se for cartão, limpamos qualquer resquício de PIX nesse registro
    if (!isPix) {
      updatePayload.ticket_url = null;
      updatePayload.qr_code = null;
      updatePayload.qr_code_base64 = null;
      updatePayload.date_of_expiration = null;
    }

    // ✅ Atualiza a inscrição com o payload único (sem duplicar objeto)
    await atualizarInscricaoParaPago(inscricaoId, updatePayload);

    logger.log("🚀 Webhook recebido para pagamento:", paymentId);

    // Envia e-mail de confirmação
    const inscricao = await buscarInscricaoDetalhadaService(inscricaoId);
    logger.log("📌 Inscrição detalhada:", {
      id: inscricao.id,
      status: inscricao.status,
      email: inscricao.email,
    });

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
          { id: inscricao.id, status: inscricao.status }
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

    // 🔥 Campos de pagamento
    metodo_pagamento: inscricao.metodo_pagamento,
    bandeira_cartao: inscricao.bandeira_cartao,
    parcelas: inscricao.parcelas,
    valor_bruto: inscricao.valor_bruto,
    valor_liquido: inscricao.valor_liquido,
    taxa_valor: inscricao.taxa_valor,
    taxa_percentual: inscricao.taxa_percentual,
    ticket_url: inscricao.ticket_url, // 👈 adicionar
    date_of_expiration: inscricao.date_of_expiration, // 👈 adicionar

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

// dentro de inscricoesService.js

const gerarPagamentoBoletoService = async (dadosFormulario) => {
  try {
    logger.log("➡️ [Boleto] Dados recebidos:", {
      ...dadosFormulario,
      cpf: logger.mascararCpf(dadosFormulario.cpf),
      telefone: logger.mascararTelefone(dadosFormulario.telefone),
    });

    const {
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

    // ⛔ Bloqueio de inscrições após data limite
    const encerrado = await verificarEncerramentoInscricao(evento_id);
    if (encerrado) {
      throw new Error("As inscrições para este evento estão encerradas.");
    }

    const limiteAtingido = await verificarLimiteInscritos(evento_id);
    if (limiteAtingido) {
      throw new Error("Limite de inscritos atingido para este evento.");
    }

    // 🔒 Validações básicas
    if (!validarCPF(cpf)) throw new Error("CPF do inscrito inválido.");
    if (responsavel_documento && !validarCPF(responsavel_documento)) {
      throw new Error("CPF do responsável inválido.");
    }
    if (!validarEmail(email)) throw new Error("E-mail inválido.");
    if (!validarTelefone(telefone)) throw new Error("Telefone inválido.");

    let valorBase = parseFloat(dadosFormulario.total_amount || valor);
    if (isNaN(valorBase) || valorBase <= 0) {
      throw new Error("Valor da inscrição inválido.");
    }

    // ✅ calcular bruto, líquido e taxas
    const valorBruto = calcularValorComTaxa(valorBase, "boleto");
    const taxa_valor = valorBruto - valorBase;
    const taxa_percentual =
      valorBase > 0 ? ((taxa_valor / valorBase) * 100).toFixed(2) : 0;

    // 🔒 Verifica duplicidade
    const jaPago = await verificarInscricaoPaga(cpf, evento_id);
    if (jaPago) {
      throw new Error("Este CPF já possui inscrição confirmada neste evento.");
    }

    // 🔄 Busca ou cria inscrição pendente
    let inscricaoId;
    const pendente = await buscarInscricaoPendente(cpf, evento_id);

    if (pendente) {
      inscricaoId = pendente.id; // ✅ define corretamente
    } else {
      inscricaoId = await criarInscricaoPendente({
        ...dadosFormulario,
        metodo_pagamento: "boleto",
        status: "pendente",
        valor_bruto: valorBruto,
        valor_liquido: valorBase,
        taxa_valor,
        taxa_percentual,
      });
    }

    const documentoCPF = responsavel_documento
      ? responsavel_documento.replace(/\D/g, "")
      : cpf.replace(/\D/g, "");
    const nomePagador = responsavel_nome || nome;
    const emailPagador = responsavel_email || email;

    const baseUrl = process.env.SERVER_URL.endsWith("/api")
      ? process.env.SERVER_URL
      : `${process.env.SERVER_URL}/api`;

    // 📦 Monta body do boleto
    const body = {
      transaction_amount: valorBruto,
      description: `Inscrição ${nome}${apelido ? ` (${apelido})` : ""}`,
      payment_method_id: "bolbradesco",
      payer: {
        email: emailPagador,
        first_name: nomePagador.split(" ")[0],
        last_name: nomePagador.split(" ").slice(1).join(" ") || "-",
        identification: {
          type: "CPF",
          number: documentoCPF,
        },
        address: {
          zip_code: dadosFormulario.zip_code,
          street_name: dadosFormulario.street_name,
          street_number: dadosFormulario.street_number,
          neighborhood: dadosFormulario.neighborhood,
          city: dadosFormulario.city,
          federal_unit: dadosFormulario.federal_unit,
        },
      },
      notification_url: `${baseUrl}/public/inscricoes/webhook`,
      external_reference: inscricaoId.toString(), // ✅ agora existe
    };

    logger.log("📦 [Boleto] Body enviado ao MP:", body);

    const result = await payment.create({
      body,
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    });

    logger.log("📦 [Boleto] Resposta MP:", {
      id: result.id,
      status: result.status,
      status_detail: result.status_detail,
    });
    // 📝 Atualiza inscrição com dados do boleto
    // 📝 Atualiza inscrição com dados do boleto
    const boletoUrl =
      result.transaction_details?.external_resource_url ||
      result.point_of_interaction?.transaction_data?.ticket_url ||
      null;

    await atualizarInscricaoPendente(inscricaoId, {
      ...dadosFormulario,
      pagamento_id: result.id,
      metodo_pagamento: "boleto",
      status: "pendente",
      valor_bruto: valorBruto,
      valor_liquido: valorBase,
      taxa_valor,
      taxa_percentual,
      ticket_url: boletoUrl,
      date_of_expiration: result.date_of_expiration || null,
    });

    const inscricao = {
      id: inscricaoId,
      pagamento_id: result.id,
      status: "pendente",
      ticket_url: boletoUrl, // 👈 agora garantido
      date_of_expiration: result.date_of_expiration || null,
      status_detail: result.status_detail,
      codigo_inscricao: `GCB-${new Date().getFullYear()}-EVT${evento_id}-${String(
        inscricaoId
      ).padStart(4, "0")}`,
      nome,
      apelido,
      email,
      telefone,
      cpf,
      data_nascimento: dadosFormulario.data_nascimento,
      evento: {
        titulo: dadosFormulario.evento_titulo || "Evento Capoeira Base",
        data_inicio: dadosFormulario.evento_data_inicio || null,
        data_fim: dadosFormulario.evento_data_fim || null,
        local: dadosFormulario.evento_local || "",
        endereco: dadosFormulario.evento_endereco || "",
      },
    };

    // 📧 Dispara e-mail de pendência
    try {
      await enviarEmailPendente(inscricao);
    } catch (emailErr) {
      logger.error("❌ Falha ao enviar e-mail de pendência:", emailErr);
    }

    return inscricao; // 👈 aqui volta pro front já com o ticket_url
  } catch (err) {
    logger.error("❌ [Service] Erro gerarPagamentoBoletoService:", err);
    throw err;
  }
};

async function getValoresEvento(eventoId) {
  logger.debug("[inscricoesService.getValoresEvento] eventoId:", eventoId);

  const evento = await inscricoesRepository.buscarValorEvento(eventoId);

  if (!evento) {
    logger.error(
      "[inscricoesService.getValoresEvento] evento não encontrado:",
      eventoId
    );
    throw new Error("Evento não encontrado");
  }

  logger.debug(
    "[inscricoesService.getValoresEvento] valor base:",
    evento.valor
  );

  // ✅ usa direto a função que retorna { pix, cartao, boleto }
  const valores = calcularValores(evento.valor);

  logger.debug(
    "[inscricoesService.getValoresEvento] valores calculados:",
    valores
  );

  return valores;
}

module.exports = {
  gerarPagamentoPixService,
  gerarPagamentoCartaoService,
  calcularParcelasService,
  calcularValorComTaxa,
  processarWebhookService,
  buscarInscricaoDetalhadaService,
  verificarInscricaoPaga,
  gerarPagamentoBoletoService,
  getValoresEvento,
};

function gerarCodigoInscricao(idInscricao, idEvento) {
  const anoAtual = new Date().getFullYear();
  return `GCB-${anoAtual}-EVT${idEvento}-${idInscricao
    .toString()
    .padStart(4, "0")}`;
}

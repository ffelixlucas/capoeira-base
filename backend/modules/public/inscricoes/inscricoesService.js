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

  console.log("📥 Dados recebidos em gerarPagamentoPixService:", dadosFormulario);


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
  if (!valor || parseFloat(valor) <= 0) {
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

  // 3️⃣ Gera PIX no Mercado Pago
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
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (pagamento.status !== "approved") return;

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
    });

    // Envia e-mail de confirmação
    const inscricao = await buscarInscricaoDetalhadaService(inscricaoId);
    if (inscricao) {
      await enviarEmailConfirmacao(inscricao);
    }
  } catch (err) {
    console.error(
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
    codigo_inscricao,
    evento: {
      titulo: inscricao.titulo,
      data_inicio: inscricao.data,
      data_fim: inscricao.data_fim,
      local: inscricao.local,
      endereco: inscricao.endereco,
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

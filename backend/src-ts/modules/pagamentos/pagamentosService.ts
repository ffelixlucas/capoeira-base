import crypto from "crypto";
import axios from "axios";
import logger from "../../utils/logger";
import {
  criarCobrancaRepository,
  atualizarCobrancaPagamentoRepository,
} from "./pagamentosRepository";

/* ======================================================
   Tipos
====================================================== */

interface CriarCobrancaInput {
  organizacao_id: number;
  origem: string;
  entidade_id: number;
  nome_pagador: string;
  cpf: string;
  telefone: string;
  email: string;
  valor_total: number;
}

interface CobrancaBase {
  id: number;
  nome_pagador: string;
  cpf: string;
  telefone: string;
  email: string;
  valor_total: number;
}

/* ======================================================
   Criar cobrança (intenção)
====================================================== */

export async function criarCobrancaService(dados: CriarCobrancaInput) {
  const {
    organizacao_id,
    origem,
    entidade_id,
    nome_pagador,
    cpf,
    telefone,
    email,
    valor_total,
  } = dados;

  if (!organizacao_id) throw new Error("organizacao_id é obrigatório");
  if (!origem) throw new Error("origem é obrigatória");
  if (!entidade_id) throw new Error("entidade_id é obrigatório");
  if (!nome_pagador) throw new Error("nome_pagador é obrigatório");
  if (!cpf) throw new Error("cpf é obrigatório");
  if (!telefone) throw new Error("telefone é obrigatório");
  if (!email) throw new Error("email é obrigatório");
  if (!valor_total || valor_total <= 0)
    throw new Error("valor_total inválido");

  logger.debug("[pagamentosService] Criando cobrança", {
    organizacao_id,
    origem,
    entidade_id,
    valor_total,
  });

  const cobrancaId = await criarCobrancaRepository(dados);

  return {
    cobranca_id: cobrancaId,
    status: "pendente",
  };
}

/* ======================================================
   CLIENTE AXIOS MERCADO PAGO
====================================================== */

async function criarPagamentoMP(payload: any) {
  try {
    const response = await axios.post(
      "https://api.mercadopago.com/v1/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": crypto.randomUUID(),
        },
      }
    );

    return response.data;
  } catch (error: any) {
    logger.error("[pagamentosService] Erro Mercado Pago", {
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

/* ======================================================
   PIX
====================================================== */

export async function gerarPagamentoPixService(cobranca: CobrancaBase) {
  logger.debug("[pagamentosService] Gerando PIX", {
    cobranca_id: cobranca.id,
    valor_total: cobranca.valor_total,
  });

  const result = await criarPagamentoMP({
    transaction_amount: Number(cobranca.valor_total),
    description: `Cobrança ${cobranca.id}`,
    payment_method_id: "pix",
    payer: {
      email: cobranca.email,
      first_name: cobranca.nome_pagador,
      identification: {
        type: "CPF",
        number: cobranca.cpf.replace(/\D/g, ""),
      },
    },
    external_reference: String(cobranca.id),
    notification_url: `${process.env.SERVER_URL}/pagamentos/webhook`,
  });

  const tx = result.point_of_interaction?.transaction_data;
  if (!tx) throw new Error("PIX sem transaction_data");

  await atualizarCobrancaPagamentoRepository({
    cobranca_id: cobranca.id,
    metodo_pagamento: "pix",
    pagamento_id: result.id,
    status: "pendente",
    qr_code: tx.qr_code,
    qr_code_base64: tx.qr_code_base64,
    ticket_url: tx.ticket_url,
    date_of_expiration: result.date_of_expiration,
  });

  return {
    status: "pendente",
    pagamento_id: result.id,
    qr_code: tx.qr_code,
    qr_code_base64: tx.qr_code_base64,
    ticket_url: tx.ticket_url,
    date_of_expiration: result.date_of_expiration,
  };
}

/* ======================================================
   CARTÃO
====================================================== */

export async function gerarPagamentoCartaoService(
  cobranca: CobrancaBase & {
    token: string;
    payment_method_id: string;
    installments?: number;
    issuer_id?: string;
  }
) {
  logger.debug("[pagamentosService] Gerando Cartão", {
    cobranca_id: cobranca.id,
  });

  const result = await criarPagamentoMP({
    transaction_amount: Number(cobranca.valor_total),
    token: cobranca.token,
    description: `Cobrança ${cobranca.id}`,
    installments: cobranca.installments || 1,
    payment_method_id: cobranca.payment_method_id,
    issuer_id: cobranca.issuer_id || undefined,
    payer: {
      email: cobranca.email,
      first_name: cobranca.nome_pagador,
      identification: {
        type: "CPF",
        number: cobranca.cpf.replace(/\D/g, ""),
      },
    },
    external_reference: String(cobranca.id),
    notification_url: `${process.env.SERVER_URL}/pagamentos/webhook`,
    statement_descriptor: "CAPOEIRA BASE",
  });

  await atualizarCobrancaPagamentoRepository({
    cobranca_id: cobranca.id,
    metodo_pagamento: "cartao",
    pagamento_id: result.id,
    status: result.status,
    status_detail: result.status_detail,
    bandeira_cartao: result.payment_method_id,
    parcelas: result.installments,
  });

  return {
    status: result.status,
    pagamento_id: result.id,
    status_detail: result.status_detail,
  };
}

/* ======================================================
   BOLETO
====================================================== */

export async function gerarPagamentoBoletoService(cobranca: CobrancaBase) {
  logger.debug("[pagamentosService] Gerando Boleto", {
    cobranca_id: cobranca.id,
  });

  const result = await criarPagamentoMP({
    transaction_amount: Number(cobranca.valor_total),
    description: `Cobrança ${cobranca.id}`,
    payment_method_id: "bolbradesco",
    payer: {
      email: cobranca.email,
      first_name: cobranca.nome_pagador.split(" ")[0],
      last_name:
        cobranca.nome_pagador.split(" ").slice(1).join(" ") || "-",
      identification: {
        type: "CPF",
        number: cobranca.cpf.replace(/\D/g, ""),
      },
    },
    external_reference: String(cobranca.id),
    notification_url: `${process.env.SERVER_URL}/pagamentos/webhook`,
  });

  const boletoUrl =
    result.transaction_details?.external_resource_url ||
    result.point_of_interaction?.transaction_data?.ticket_url ||
    null;

  await atualizarCobrancaPagamentoRepository({
    cobranca_id: cobranca.id,
    metodo_pagamento: "boleto",
    pagamento_id: result.id,
    status: "pendente",
    ticket_url: boletoUrl,
    date_of_expiration: result.date_of_expiration,
  });

  return {
    status: "pendente",
    pagamento_id: result.id,
    ticket_url: boletoUrl,
    date_of_expiration: result.date_of_expiration,
  };
}

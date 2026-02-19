import connection from "../../database/connection";
import logger from "../../utils/logger";
import { PoolConnection } from "mysql2/promise";
import { ExecutorQuery } from "../../database/types";

/* ======================================================
   Interfaces
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

interface AtualizarCobrancaPagamentoInput {
  cobranca_id: number;
  pagamento_id?: number;
  metodo_pagamento?: "pix" | "cartao" | "boleto";
  status?: string;
  status_detail?: string;
  qr_code?: string | null;
  qr_code_base64?: string | null;
  ticket_url?: string | null;
  date_of_expiration?: Date | string | null;
  bandeira_cartao?: string | null;
  parcelas?: number | null;
  valor_bruto?: number | null;
  valor_liquido?: number | null;
  taxa_valor?: number | null;
  taxa_percentual?: number | null;
}

/* ======================================================
   Organização
====================================================== */

export async function buscarOrganizacaoPorSlug(slug: string) {
  const [rows]: any = await connection.query(
    `
    SELECT id
    FROM organizacoes
    WHERE slug = ?
      AND status = 'ativo'
    LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
}

/* ======================================================
   Criar Cobrança
====================================================== */

export async function criarCobrancaRepository(
  dados: CriarCobrancaInput
): Promise<number> {
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

  logger.debug("[pagamentosRepository] Criando cobrança", {
    organizacao_id,
    origem,
    entidade_id,
    valor_total,
  });

  const [result]: any = await connection.query(
    `
    INSERT INTO pagamentos_cobrancas
      (
        organizacao_id,
        origem,
        entidade_id,
        nome_pagador,
        cpf,
        telefone,
        email,
        valor_total,
        status
      )
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
    `,
    [
      organizacao_id,
      origem,
      entidade_id,
      nome_pagador,
      cpf,
      telefone,
      email,
      valor_total,
    ]
  );

  logger.debug("[pagamentosRepository] Cobrança criada", {
    cobranca_id: result.insertId,
  });

  return result.insertId;
}

/* ======================================================
   Atualizar Cobrança com Pagamento (PIX / Cartão / Boleto)
====================================================== */

export async function atualizarCobrancaPagamentoRepository(
  dados: AtualizarCobrancaPagamentoInput
) {
  const {
    cobranca_id,
    pagamento_id,
    metodo_pagamento,
    status,
    status_detail,
    qr_code,
    qr_code_base64,
    ticket_url,
    date_of_expiration,
    bandeira_cartao,
    parcelas,
    valor_bruto,
    valor_liquido,
    taxa_valor,
    taxa_percentual,
  } = dados;

  logger.debug("[pagamentosRepository] Atualizando cobrança", {
    cobranca_id,
    metodo_pagamento,
    status,
  });

  await connection.query(
    `
    UPDATE pagamentos_cobrancas
    SET
      pagamento_id      = COALESCE(?, pagamento_id),
      metodo_pagamento  = COALESCE(?, metodo_pagamento),
      status            = COALESCE(?, status),
      status_detail     = COALESCE(?, status_detail),
      qr_code           = COALESCE(?, qr_code),
      qr_code_base64    = COALESCE(?, qr_code_base64),
      ticket_url        = COALESCE(?, ticket_url),
      date_of_expiration= COALESCE(?, date_of_expiration),
      bandeira_cartao   = COALESCE(?, bandeira_cartao),
      parcelas          = COALESCE(?, parcelas),
      valor_bruto       = COALESCE(?, valor_bruto),
      valor_liquido     = COALESCE(?, valor_liquido),
      taxa_valor        = COALESCE(?, taxa_valor),
      taxa_percentual   = COALESCE(?, taxa_percentual)
    WHERE id = ?
    `,
    [
      pagamento_id ?? null,
      metodo_pagamento ?? null,
      status ?? null,
      status_detail ?? null,
      qr_code ?? null,
      qr_code_base64 ?? null,
      ticket_url ?? null,
      date_of_expiration ?? null,
      bandeira_cartao ?? null,
      parcelas ?? null,
      valor_bruto ?? null,
      valor_liquido ?? null,
      taxa_valor ?? null,
      taxa_percentual ?? null,
      cobranca_id,
    ]
  );

  logger.debug("[pagamentosRepository] Cobrança atualizada", {
    cobranca_id,
  });
}

/* ======================================================
   Buscar Cobrança
====================================================== */

export async function buscarCobrancaPorId(cobrancaId: number) {
  const [rows]: any = await connection.query(
    `
    SELECT
      id,
      nome_pagador,
      cpf,
      telefone,
      email,
      valor_total
    FROM pagamentos_cobrancas
    WHERE id = ?
    LIMIT 1
    `,
    [cobrancaId]
  );

  return rows[0] || null;
}

export async function buscarCobrancaPorIdRepository(cobrancaId: number) {
  const [rows]: any = await connection.query(
    `
    SELECT
      id,
      organizacao_id,
      origem,
      entidade_id,
      status,
      consequencia_executada,
      nome_pagador,
      telefone,
      email
    FROM pagamentos_cobrancas
    WHERE id = ?
    LIMIT 1
    `,
    [cobrancaId]
  );

  return rows[0] || null;
}

/* ======================================================
   Marcar Consequência Executada (Suporte a Transação)
====================================================== */

export async function marcarConsequenciaExecutadaRepository(
  cobrancaId: number,
  trx?: PoolConnection
) {
  const executor: ExecutorQuery = trx ?? connection;

  await executor.query(
    `
      UPDATE pagamentos_cobrancas
      SET consequencia_executada = true
      WHERE id = ?
    `,
    [cobrancaId]
  );
}

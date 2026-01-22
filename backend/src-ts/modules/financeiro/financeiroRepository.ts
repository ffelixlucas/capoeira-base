import connection from "../../database/connection";
import logger from "../../utils/logger";

interface ListarCobrancasParams {
  organizacaoId: number;
  status?: string;
  origem?: string;
}

async function listarCobrancas({
  organizacaoId,
  status,
  origem,
}: ListarCobrancasParams) {
  let sql = `
    SELECT *
    FROM financeiro_cobrancas
    WHERE organizacao_id = ?
  `;

  const params: any[] = [organizacaoId];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (origem) {
    sql += " AND origem = ?";
    params.push(origem);
  }

  sql += " ORDER BY data_vencimento ASC";

  logger.debug("[financeiroRepository] listarCobrancas", {
    organizacaoId,
    status,
    origem,
  });

  const [rows] = await connection.query(sql, params);
  return rows;
}

async function buscarCobrancaPorId(organizacaoId: number, cobrancaId: number) {
  const sql = `
    SELECT *
    FROM financeiro_cobrancas
    WHERE id = ?
      AND organizacao_id = ?
    LIMIT 1
  `;

  logger.debug("[financeiroRepository] buscarCobrancaPorId", {
    organizacaoId,
    cobrancaId,
  });

  const [rows]: any = await connection.query(sql, [cobrancaId, organizacaoId]);

  return rows[0] || null;
}
interface CriarCobrancaParams {
  organizacaoId: number;
  cpf: string;
  nome_pagador: string;
  origem: "mensalidade" | "evento" | "produto" | "outro";
  referencia_id?: number | null;
  descricao: string;
  valor_original: number;
  valor_final: number;
  data_vencimento: string;
  criado_por: "sistema" | "admin";
  observacoes?: string | null;
}

async function criarCobranca(params: CriarCobrancaParams) {
  const sql = `
    INSERT INTO financeiro_cobrancas (
      organizacao_id,
      cpf,
      nome_pagador,
      origem,
      referencia_id,
      descricao,
      valor_original,
      valor_final,
      data_emissao,
      data_vencimento,
      status,
      criado_por,
      observacoes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, 'pendente', ?, ?)
  `;

  const values = [
    params.organizacaoId,
    params.cpf,
    params.nome_pagador,
    params.origem,
    params.referencia_id ?? null,
    params.descricao,
    params.valor_original,
    params.valor_final,
    params.data_vencimento,
    params.criado_por,
    params.observacoes ?? null,
  ];

  const [result]: any = await connection.query(sql, values);
  return result.insertId;
}

interface AtualizarStatusParams {
  organizacaoId: number;
  cobrancaId: number;
  status: "pago" | "cancelado";
  metodo_pagamento?: "pix" | "cartao" | "dinheiro";
  data_pagamento?: string;
}

async function atualizarStatusCobranca(params: AtualizarStatusParams) {
  const sql = `
    UPDATE financeiro_cobrancas
    SET
      status = ?,
      metodo_pagamento = ?,
      data_pagamento = ?,
      pago_manual = 1,
      updated_at = NOW()
    WHERE id = ?
      AND organizacao_id = ?
  `;

  const values = [
    params.status,
    params.metodo_pagamento || null,
    params.data_pagamento || new Date(),
    params.cobrancaId,
    params.organizacaoId,
  ];

  await connection.query(sql, values);
}

export default {
  listarCobrancas,
  buscarCobrancaPorId,
  criarCobranca,
  atualizarStatusCobranca,
};

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

async function buscarCobrancaPorId(
  organizacaoId: number,
  cobrancaId: number
) {
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

  const [rows]: any = await connection.query(sql, [
    cobrancaId,
    organizacaoId,
  ]);

  return rows[0] || null;
}

export default {
  listarCobrancas,
  buscarCobrancaPorId,
};

import connection from "../../../database/connection";
import logger from "../../../utils/logger";

async function listarTiposVariacao(organizacaoId: number) {
  const sql = `
    SELECT id, nome
    FROM variacoes_tipos
    WHERE organizacao_id = ?
    ORDER BY nome ASC
  `;

  logger.debug("[variacoesRepository] listarTiposVariacao", {
    organizacaoId,
  });

  const [rows] = await connection.query(sql, [organizacaoId]);
  return rows;
}

async function listarValoresPorTipo(
  organizacaoId: number,
  tipoId: number
) {
  const sql = `
    SELECT id, valor
    FROM variacoes_valores
    WHERE organizacao_id = ?
      AND variacao_tipo_id = ?
    ORDER BY valor ASC
  `;

  logger.debug("[variacoesRepository] listarValoresPorTipo", {
    organizacaoId,
    tipoId,
  });

  const [rows] = await connection.query(sql, [
    organizacaoId,
    tipoId,
  ]);

  return rows;
}

export default {
  listarTiposVariacao,
  listarValoresPorTipo,
};
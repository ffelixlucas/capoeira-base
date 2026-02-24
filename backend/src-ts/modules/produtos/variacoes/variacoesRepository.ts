import connection from "../../../database/connection";
import logger from "../../../utils/logger";

/* ======================================================
   LISTAR TIPOS
====================================================== */

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

/* ======================================================
   LISTAR VALORES
====================================================== */

async function listarValoresPorTipo(
  organizacaoId: number,
  tipoId: number
) {
  const sql = `
  SELECT id, valor
  FROM variacoes_valores
  WHERE organizacao_id = ?
  AND variacao_tipo_id = ?
  AND ativo = 1
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

/* ======================================================
   CRIAR TIPO
====================================================== */

async function criarTipoVariacao(
  organizacaoId: number,
  nome: string
) {
  const sql = `
    INSERT INTO variacoes_tipos
      (organizacao_id, nome)
    VALUES
      (?, ?)
  `;

  logger.debug("[variacoesRepository] criarTipoVariacao", {
    organizacaoId,
    nome,
  });

  const [result]: any = await connection.query(sql, [
    organizacaoId,
    nome,
  ]);

  return result.insertId;
}

/* ======================================================
   EXCLUIR TIPO
====================================================== */

async function excluirTipoVariacao(
  organizacaoId: number,
  tipoId: number
) {
  const sql = `
    DELETE FROM variacoes_tipos
    WHERE id = ?
      AND organizacao_id = ?
  `;

  logger.debug("[variacoesRepository] excluirTipoVariacao", {
    organizacaoId,
    tipoId,
  });

  await connection.query(sql, [tipoId, organizacaoId]);
}

/* ======================================================
   CRIAR VALOR
====================================================== */

async function criarValorVariacao(
  organizacaoId: number,
  tipoId: number,
  valor: string
) {
  const sql = `
    INSERT INTO variacoes_valores
      (organizacao_id, variacao_tipo_id, valor)
    VALUES
      (?, ?, ?)
  `;

  logger.debug("[variacoesRepository] criarValorVariacao", {
    organizacaoId,
    tipoId,
    valor,
  });

  const [result]: any = await connection.query(sql, [
    organizacaoId,
    tipoId,
    valor,
  ]);

  return result.insertId;
}

/* ======================================================
   EXCLUIR VALOR
====================================================== */

async function excluirValorVariacao(
  organizacaoId: number,
  valorId: number
) {
  const sql = `
    DELETE FROM variacoes_valores
    WHERE id = ?
      AND organizacao_id = ?
  `;

  logger.debug("[variacoesRepository] excluirValorVariacao", {
    organizacaoId,
    valorId,
  });

  await connection.query(sql, [valorId, organizacaoId]);
}

export default {
  listarTiposVariacao,
  listarValoresPorTipo,
  criarTipoVariacao,
  excluirTipoVariacao,
  criarValorVariacao,
  excluirValorVariacao,
};
// modules/categorias/categoriasRepository.js
const db = require("../../database/connection");
const { logger } = require("../../utils/logger");

// Listar todas as categorias da organização
async function listarTodas(organizacaoId) {
  logger.debug("[categoriasRepository] listarTodas", { organizacaoId });

  const [rows] = await db.execute(
    `
    SELECT id, nome
    FROM categorias
    WHERE organizacao_id = ?
    ORDER BY nome ASC
    `,
    [organizacaoId]
  );

  return rows;
}

// Criar categoria
async function criar({ nome, organizacaoId }) {
  logger.info("[categoriasRepository] criar", { nome, organizacaoId });

  const [result] = await db.execute(
    `
    INSERT INTO categorias (nome, organizacao_id)
    VALUES (?, ?)
    `,
    [nome, organizacaoId]
  );

  return result.insertId;
}

// Atualizar
async function atualizar(id, { nome, organizacaoId }) {
  logger.info("[categoriasRepository] atualizar", { id, nome, organizacaoId });

  const [result] = await db.execute(
    `
    UPDATE categorias
    SET nome = ?
    WHERE id = ? AND organizacao_id = ?
    `,
    [nome, id, organizacaoId]
  );

  return result.affectedRows > 0;
}

// Remover
async function remover(id, organizacaoId) {
  logger.warn("[categoriasRepository] remover", { id, organizacaoId });

  const [result] = await db.execute(
    `
    DELETE FROM categorias
    WHERE id = ? AND organizacao_id = ?
    `,
    [id, organizacaoId]
  );

  return result.affectedRows > 0;
}

// Buscar categoria por ID
async function buscarPorId(id, organizacaoId) {
  logger.debug("[categoriasRepository] buscarPorId", { id, organizacaoId });

  const [rows] = await db.execute(
    `
    SELECT id, nome, organizacao_id
    FROM categorias
    WHERE id = ? AND organizacao_id = ?
    `,
    [id, organizacaoId]
  );

  return rows[0] || null;
}

// Buscar categoria compatível por idade (usado na pré-matrícula)
async function buscarPorIdade(idade, organizacaoId) {
  logger.debug("[categoriasRepository] buscarPorIdade", { idade, organizacaoId });

  const [rows] = await db.execute(
    `
    SELECT 
      t.id AS turma_id,
      t.nome AS turma_nome,
      t.faixa_etaria,
      t.categoria_id,
      c.nome AS categoria_nome
    FROM turmas t
    LEFT JOIN categorias c ON c.id = t.categoria_id
    WHERE t.organizacao_id = ?
      AND (t.idade_min IS NULL OR t.idade_min <= ?)
      AND (t.idade_max IS NULL OR t.idade_max >= ?)
    ORDER BY 
      (t.idade_min IS NULL AND t.idade_max IS NULL) ASC,
      t.idade_min ASC
    LIMIT 1
    `,
    [organizacaoId, idade, idade]
  );

  return rows[0] || null;
}

module.exports = {
  listarTodas,
  criar,
  atualizar,
  remover,
  buscarPorId,
  buscarPorIdade,
};

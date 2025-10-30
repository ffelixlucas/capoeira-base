// 🎯 Repository compartilhado - Organizações
// Reúne consultas reutilizáveis sobre a tabela `organizacoes`
// Usado por módulos públicos e administrativos (multi-organização híbrido)

const db = require("../../../database/connection");
const logger = require("../../../utils/logger");

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar ID da organização pelo slug público                              */
/* -------------------------------------------------------------------------- */
async function buscarIdPorSlug(slug) {
  try {
    if (!slug) throw new Error("Slug não informado.");

    const [rows] = await db.execute(
      "SELECT id FROM organizacoes WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (!rows.length) {
      logger.warn(`[organizacaoRepository] Slug não encontrado: ${slug}`);
      return null;
    }

    logger.debug(
      `[organizacaoRepository] Slug "${slug}" resolvido → org ${rows[0].id}`
    );
    return rows[0].id;
  } catch (err) {
    logger.error(
      "[organizacaoRepository] Erro ao buscar ID da organização por slug:",
      err.message
    );
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar informações completas da organização (nome, grupo, etc.)         */
/* -------------------------------------------------------------------------- */
async function buscarPorSlug(slug) {
  try {
    if (!slug) throw new Error("Slug não informado.");

    const [rows] = await db.execute(
      "SELECT * FROM organizacoes WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (!rows.length) {
      logger.warn(`[organizacaoRepository] Organização não encontrada para slug "${slug}"`);
      return null;
    }

    logger.debug(`[organizacaoRepository] Organização encontrada via slug "${slug}"`);
    return rows[0];
  } catch (err) {
    logger.error(
      "[organizacaoRepository] Erro ao buscar organização por slug:",
      err.message
    );
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar organização completa por ID (uso interno)                        */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id) {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM organizacoes WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      logger.warn(`[organizacaoRepository] Organização não encontrada para ID ${id}`);
      return null;
    }

    logger.debug(`[organizacaoRepository] Organização encontrada (ID ${id})`);
    return rows[0];
  } catch (err) {
    logger.error(
      "[organizacaoRepository] Erro ao buscar organização por ID:",
      err.message
    );
    throw err;
  }
}

module.exports = {
  buscarIdPorSlug,
  buscarPorSlug,
  buscarPorId,
};

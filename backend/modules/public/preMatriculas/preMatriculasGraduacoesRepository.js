// 🎯 Repository Público - Graduações
// Exclusivo para rotas públicas da pré-matrícula

const db = require("../../../database/connection");
const logger = require("../../../utils/logger.js");

/**
 * Lista graduações filtradas pela categoria e pela organização (multi-org)
 */
async function listarGraduacoesPublic({ categoriaId, organizacaoId }) {
  try {
    logger.debug(
      "[preMatriculasGraduacoesRepository] Listando graduações públicas",
      { categoriaId, organizacaoId }
    );

    const [rows] = await db.execute(
      `
      SELECT id, nome, ordem
      FROM graduacoes
      WHERE categoria_id = ?
        AND organizacao_id = ?
      ORDER BY ordem ASC
    `,
      [categoriaId, organizacaoId]
    );

    return rows;
  } catch (err) {
    logger.error(
      "[preMatriculasGraduacoesRepository] Erro ao listar graduações:",
      err.message
    );
    throw err;
  }
}

module.exports = {
  listarGraduacoesPublic,
};

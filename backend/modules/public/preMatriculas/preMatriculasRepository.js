// 🎯 Repository - Pré-Matrículas Públicas
// Responsável por acessar o banco e registrar novas pré-matrículas

const db = require("../../../database/connection");
const logger = require("../../../utils/logger");

/**
 * Cria uma nova pré-matrícula
 * @param {Object} dados - dados do formulário público
 * @returns {number} id da nova pré-matrícula
 */
async function criarPreMatricula(dados) {
  try {
    const sql = `
  INSERT INTO pre_matriculas (
    organizacao_id,
    nome,
    nascimento,
    cpf,
    email,
    telefone,
    ja_treinou,
    grupo_origem,
    observacoes_medicas,
    status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
`;

    const params = [
      dados.organizacao_id || null,
      dados.nome,
      dados.nascimento,
      dados.cpf.replace(/\D/g, ""), 
      dados.email.toLowerCase(),
      dados.telefone || null,
      dados.ja_treinou || "nao", 
      dados.grupo_origem || null,
      dados.observacoes_medicas || null,
    ];

    logger.debug("[preMatriculasRepository] SQL →", sql);
    logger.debug("[preMatriculasRepository] Params →", params);

    const [result] = await db.execute(sql, params);

    logger.info("[preMatriculasRepository] Pré-matrícula criada com sucesso", {
      id: result.insertId,
      nome: dados.nome,
    });

    return result.insertId;
  } catch (err) {
    logger.error(
      "[preMatriculasRepository] Erro ao criar pré-matrícula:",
      err.message
    );
    throw err;
  }
}

/**
 * Busca todas as pré-matrículas pendentes (usado no painel admin)
 */
async function listarPendentes(organizacaoId) {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM pre_matriculas
       WHERE status = 'pendente' AND organizacao_id = ?
       ORDER BY data_criacao DESC`,
      [organizacaoId]
    );

    logger.debug(
      `[preMatriculasRepository] ${rows.length} pré-matrículas pendentes encontradas.`
    );
    return rows;
  } catch (err) {
    logger.error(
      "[preMatriculasRepository] Erro ao listar pendentes:",
      err.message
    );
    throw err;
  }
}

/**
 * Atualiza status da pré-matrícula (aprovada, rejeitada, etc.)
 */
async function atualizarStatus(id, novoStatus) {
  try {
    await db.execute(
      `UPDATE pre_matriculas SET status = ?, data_atualizacao = NOW() WHERE id = ?`,
      [novoStatus, id]
    );
    logger.info(
      `[preMatriculasRepository] Status atualizado → ${novoStatus} (ID ${id})`
    );
  } catch (err) {
    logger.error(
      "[preMatriculasRepository] Erro ao atualizar status:",
      err.message
    );
    throw err;
  }
}

/**
 * Busca o nome do grupo (organização) para exibir no formulário público
 */
async function buscarGrupoPorOrganizacaoId(organizacaoId) {
  try {
    const [rows] = await db.execute(
      "SELECT grupo FROM organizacoes WHERE id = ?",
      [organizacaoId]
    );
    return rows.length > 0 ? rows[0].grupo : null;
  } catch (err) {
    logger.error(
      "[preMatriculasRepository] Erro ao buscar grupo:",
      err.message
    );
    throw err;
  }
}

module.exports = {
  criarPreMatricula,
  listarPendentes,
  atualizarStatus,
  buscarGrupoPorOrganizacaoId,
};

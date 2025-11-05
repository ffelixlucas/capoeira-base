// backend/modules/equipeRoles/equipeRolesRepository.js
const db = require("../../../database/connection");
const logger = require("../../../utils/logger");

/* -------------------------------------------------------------------------- */
/* 🔍 Buscar todos os papéis de um membro específico (multi-org seguro)       */
/* -------------------------------------------------------------------------- */
async function buscarRolesPorMembro(equipeId, organizacaoId) {
  const query = `
    SELECT r.id, r.nome, r.descricao
    FROM roles r
    JOIN equipe_roles er ON r.id = er.role_id
    WHERE er.equipe_id = ? AND er.organizacao_id = ?
  `;
  const [rows] = await db.query(query, [equipeId, organizacaoId]);
  logger.debug("[equipeRolesRepository] Roles carregadas", { equipeId, organizacaoId, total: rows.length });
  return rows;
}

/* -------------------------------------------------------------------------- */
/* 🧱 Atribuir papel a um membro (com herança automática de organizacao_id)   */
/* -------------------------------------------------------------------------- */
async function atribuirRoleAMembro(equipeId, roleId) {
  const query = `
    INSERT INTO equipe_roles (equipe_id, role_id, organizacao_id)
    SELECT ?, ?, organizacao_id
    FROM equipe
    WHERE id = ?
  `;
  logger.debug("[equipeRolesRepository] Atribuindo papel", { equipeId, roleId });
  await db.query(query, [equipeId, roleId, equipeId]);
}

/* -------------------------------------------------------------------------- */
/* ❌ Remover papel de um membro (multi-org)                                  */
/* -------------------------------------------------------------------------- */
async function removerRoleDeMembro(equipeId, roleId, organizacaoId) {
  const query = `
    DELETE FROM equipe_roles
    WHERE equipe_id = ? AND role_id = ? AND organizacao_id = ?
  `;
  logger.debug("[equipeRolesRepository] Removendo papel", { equipeId, roleId, organizacaoId });
  await db.query(query, [equipeId, roleId, organizacaoId]);
}

/* -------------------------------------------------------------------------- */
/* 🧹 Remover todos os papéis de um membro (multi-org)                        */
/* -------------------------------------------------------------------------- */
async function removerTodosOsRoles(equipeId, organizacaoId) {
  if (!equipeId || typeof equipeId !== "number") {
    logger.warn("🚫 ID inválido em removerTodosOsRoles:", equipeId);
    return;
  }
  const sql = `
    DELETE FROM equipe_roles
    WHERE equipe_id = ? AND organizacao_id = ?
  `;
  const [result] = await db.query(sql, [equipeId, organizacaoId]);
  logger.debug("[equipeRolesRepository] Todos os papéis removidos", { equipeId, organizacaoId, result });
  return result;
}

/* -------------------------------------------------------------------------- */
/* 🔎 Checar se papel já existe (multi-org)                                   */
/* -------------------------------------------------------------------------- */
async function checarSePapelExiste(membroId, roleId, organizacaoId) {
  const query = `
    SELECT 1 FROM equipe_roles
    WHERE equipe_id = ? AND role_id = ? AND organizacao_id = ?
    LIMIT 1
  `;
  const [rows] = await db.query(query, [membroId, roleId, organizacaoId]);
  const existe = rows.length > 0;
  logger.debug("[equipeRolesRepository] Papel existe?", { membroId, roleId, organizacaoId, existe });
  return existe;
}

/* -------------------------------------------------------------------------- */
module.exports = {
  buscarRolesPorMembro,
  atribuirRoleAMembro,
  removerRoleDeMembro,
  removerTodosOsRoles,
  checarSePapelExiste,
};

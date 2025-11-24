// backend/modules/equipeRoles/equipeRolesService.js
const {
  buscarRolesPorMembro,
  atribuirRoleAMembro,
  removerRoleDeMembro,
  removerTodosOsRoles,
  checarSePapelExiste,
} = require("./equipeRolesRepository");
const logger = require("../../../utils/logger.js");

/* -------------------------------------------------------------------------- */
/* 🔍 Listar papéis de um membro (multi-org)                                  */
/* -------------------------------------------------------------------------- */
async function listarRoles(membroId, organizacaoId) {
  logger.debug("[equipeRolesService] Listando roles", {
    membroId,
    organizacaoId,
  });
  return await buscarRolesPorMembro(membroId, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🧱 Atribuir papel ao membro (multi-org)                                    */
/* -------------------------------------------------------------------------- */
async function adicionarRole(membroId, roleId, organizacaoId) {
  const jaExiste = await checarSePapelExiste(membroId, roleId, organizacaoId);
  if (jaExiste) {
    throw new Error("Papel já atribuído a este membro");
  }

  await atribuirRoleAMembro(membroId, roleId);
  logger.debug("[equipeRolesService] Papel atribuído", {
    membroId,
    roleId,
    organizacaoId,
  });
}

/* -------------------------------------------------------------------------- */
/* ❌ Remover papel do membro (multi-org)                                     */
/* -------------------------------------------------------------------------- */
async function removerRole(membroId, roleId, organizacaoId) {
  await removerRoleDeMembro(membroId, roleId, organizacaoId);
  logger.debug("[equipeRolesService] Papel removido", {
    membroId,
    roleId,
    organizacaoId,
  });
}

/* -------------------------------------------------------------------------- */
/* 🧹 Remover todos os papéis do membro (multi-org)                           */
/* -------------------------------------------------------------------------- */
async function removerTodosOsRolesService(equipeId, organizacaoId) {
  logger.debug("[equipeRolesService] Removendo todos os roles", {
    equipeId,
    organizacaoId,
  });
  return await removerTodosOsRoles(equipeId, organizacaoId);
}

/* -------------------------------------------------------------------------- */
module.exports = {
  listarRoles,
  adicionarRole,
  removerRole,
  removerTodosOsRoles: removerTodosOsRolesService,
};

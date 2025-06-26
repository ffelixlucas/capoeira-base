const {
  buscarRolesPorMembro,
  atribuirRoleAMembro,
  removerRoleDeMembro,
  removerTodosOsRoles,
  checarSePapelExiste, // ✅ novo método
} = require("./equipeRolesRepository");

// Listar papéis de um membro
async function listarRoles(membroId) {
  return await buscarRolesPorMembro(membroId);
}

// Atribuir papel ao membro
async function adicionarRole(membroId, roleId) {
  const jaExiste = await checarSePapelExiste(membroId, roleId);
  if (jaExiste) {
    throw new Error("Papel já atribuído a este membro");
  }

  await atribuirRoleAMembro(membroId, roleId);
}

// Remover papel do membro
async function removerRole(membroId, roleId) {
  await removerRoleDeMembro(membroId, roleId);
}

// Remover todos os papéis do membro
async function removerTodosOsRolesService(equipeId) {
  return await removerTodosOsRoles(equipeId);
}

module.exports = {
  listarRoles,
  adicionarRole,
  removerRole,
  removerTodosOsRoles: removerTodosOsRolesService,
};

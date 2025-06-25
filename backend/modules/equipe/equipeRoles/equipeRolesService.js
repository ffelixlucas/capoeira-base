const {
    buscarRolesPorMembro,
    atribuirRoleAMembro,
    removerRoleDeMembro,
  } = require('./equipeRolesRepository');
  
  const db = require('../../../database/connection');
  
  // Listar papéis de um membro
  async function listarRoles(membroId) {
    return await buscarRolesPorMembro(membroId);
  }
  
  // Atribuir papel ao membro
  async function adicionarRole(membroId, roleId) {
    // Verifica se o papel já está atribuído
    const query = `
      SELECT 1 FROM equipe_roles
      WHERE equipe_id = ? AND role_id = ?
      LIMIT 1
    `;
    const [rows] = await db.query(query, [membroId, roleId]);
    if (rows.length > 0) {
      throw new Error('Papel já atribuído a este membro');
    }
  
    await atribuirRoleAMembro(membroId, roleId);
  }
  
  // Remover papel do membro
  async function removerRole(membroId, roleId) {
    await removerRoleDeMembro(membroId, roleId);
  }
  
  module.exports = {
    listarRoles,
    adicionarRole,
    removerRole,
  };
  
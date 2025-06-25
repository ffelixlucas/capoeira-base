const db = require('../../../database/connection');

// Buscar todos os papéis de um membro específico
async function buscarRolesPorMembro(equipeId) {
  const query = `
    SELECT r.id, r.nome, r.descricao
    FROM roles r
    JOIN equipe_roles er ON r.id = er.role_id
    WHERE er.equipe_id = ?
  `;
  const [rows] = await db.query(query, [equipeId]);
  return rows;
}

// Atribuir um papel a um membro (evitando duplicidade no service)
async function atribuirRoleAMembro(equipeId, roleId) {
  const query = `INSERT INTO equipe_roles (equipe_id, role_id) VALUES (?, ?)`;
  await db.query(query, [equipeId, roleId]);
}

// Remover um papel de um membro
async function removerRoleDeMembro(equipeId, roleId) {
  const query = `DELETE FROM equipe_roles WHERE equipe_id = ? AND role_id = ?`;
  await db.query(query, [equipeId, roleId]);
}

module.exports = {
  buscarRolesPorMembro,
  atribuirRoleAMembro,
  removerRoleDeMembro,
};

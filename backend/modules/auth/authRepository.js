const db = require('../../database/connection');

async function buscarMembroPorEmail(email) {
  const [result] = await db.execute(
    `
    SELECT 
      e.*, 
      GROUP_CONCAT(r.nome) AS roles 
    FROM equipe e
    LEFT JOIN equipe_roles er ON e.id = er.equipe_id
    LEFT JOIN roles r ON er.role_id = r.id
    WHERE e.email = ?
    GROUP BY e.id
    LIMIT 1
    `,
    [email]
  );

  if (result.length === 0) {
    return null;
  }

  const membro = result[0];
  membro.roles = membro.roles ? membro.roles.split(',') : [];

  return membro;
}

module.exports = {
  buscarMembroPorEmail,
};

const db = require('../database/connection');

async function buscarUsuarioPorEmail(email) {
  const [result] = await db.execute(
    'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  );
  return result[0] || null;
}

module.exports = {
  buscarUsuarioPorEmail,
};

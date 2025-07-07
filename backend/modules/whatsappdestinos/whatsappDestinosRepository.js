const db = require("../../database/connection");

async function listarDestinos() {
  const query = `
    SELECT 
      wd.tipo,
      COALESCE(e1.nome, e2.nome) AS nome,
      COALESCE(e1.whatsapp, e2.whatsapp) AS telefone
    FROM whatsapp_destinos wd
    LEFT JOIN equipe e1 ON wd.membro_id = e1.id AND e1.status = 'ativo'
    LEFT JOIN equipe e2 ON wd.membro_backup_id = e2.id AND e2.status = 'ativo';
  `;
  const [rows] = await db.query(query);
  return rows;
}

module.exports = { listarDestinos };

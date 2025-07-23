// backend/modules/turmas/turmasRepository.js
const connection = require("../../database/connection");

async function listarAtivas() {
  const [rows] = await connection.execute(`
    SELECT id, nome, faixa_etaria, equipe_id
    FROM turmas
    WHERE data_fim IS NULL OR data_fim IS NULL
    ORDER BY nome
  `);
  return rows;
}

module.exports = { listarAtivas };

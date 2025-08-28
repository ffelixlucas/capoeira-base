// backend/modules/inscricoes/logsRepository.js
const db = require("../../database/connection");

const registrarLogTransacao = async (inscricaoId, acao, status, detalhes = null) => {
  await db.execute(
    `INSERT INTO logs_transacoes (inscricao_id, acao, status, detalhes)
     VALUES (?, ?, ?, ?)`,
    [inscricaoId, acao, status, detalhes ? JSON.stringify(detalhes) : null]
  );
};

module.exports = { registrarLogTransacao };

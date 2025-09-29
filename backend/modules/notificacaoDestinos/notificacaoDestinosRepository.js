const db = require("../../database/connection");

// Lista e-mails de notificação por grupo e tipo (ex.: matricula, evento, pagamento)
async function listarPorTipo(grupoId, tipo) {
  const [rows] = await db.execute(
    "SELECT id, email FROM notificacao_destinos WHERE grupo_id = ? AND tipo = ? ORDER BY id",
    [grupoId, tipo]
  );
  return rows;
}

async function criar(grupoId, tipo, email) {
  const [result] = await db.execute(
    "INSERT INTO notificacao_destinos (grupo_id, tipo, email) VALUES (?, ?, ?)",
    [grupoId, tipo, email]
  );
  return { id: result.insertId, grupo_id: grupoId, tipo, email };
}

async function remover(id) {
  await db.execute("DELETE FROM notificacao_destinos WHERE id = ?", [id]);
  return true;
}

module.exports = { listarPorTipo, criar, remover };

const db = require("../../database/connection");

async function getAllEquipe() {
  const [rows] = await db.query("SELECT * FROM equipe ORDER BY nome ASC");
  return rows;
}

async function createEquipe({ nome, telefone, whatsapp, email, status, observacoes, senha_hash }) {
  const [result] = await db.query(
    "INSERT INTO equipe (nome, telefone, whatsapp, email, status, observacoes, senha_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [nome, telefone, whatsapp, email, status, observacoes, senha_hash]
  );
  return result.insertId;
}

async function updateEquipe(id, { nome, telefone, whatsapp, email, status, observacoes }) {
  const [result] = await db.query(
    "UPDATE equipe SET nome = ?, telefone = ?, whatsapp = ?, email = ?, status = ?, observacoes = ? WHERE id = ?",
    [nome, telefone, whatsapp, email, status, observacoes, id]
  );
  return result.affectedRows;
}

async function deleteEquipe(id) {
  const [result] = await db.query("DELETE FROM equipe WHERE id = ?", [id]);
  return result.affectedRows;
}

module.exports = {
  getAllEquipe,
  createEquipe,
  updateEquipe,
  deleteEquipe,
};

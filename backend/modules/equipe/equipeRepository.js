const db = require("../../database/connection");

async function getAllEquipe() {
  const [rows] = await db.query(`
    SELECT id, nome, telefone, whatsapp, email, status, observacoes, criado_em, atualizado_em
    FROM equipe
    ORDER BY nome ASC
  `);

  // Para cada membro, buscar seus papéis (roles)
  for (const membro of rows) {
    const [roles] = await db.query(
      `
      SELECT r.id, r.nome
      FROM equipe_roles er
      JOIN roles r ON er.role_id = r.id
      WHERE er.equipe_id = ?
      `,
      [membro.id]
    );
    membro.roles = roles; // adiciona a propriedade `roles`
  }

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
  try {
    const [result] = await db.query(
      "UPDATE equipe SET nome = ?, telefone = ?, whatsapp = ?, email = ?, status = ?, observacoes = ? WHERE id = ?",
      [nome, telefone, whatsapp, email, status, observacoes, id]
    );
    return result.affectedRows;
  } catch (err) {
    console.error("❌ ERRO SQL AO ATUALIZAR MEMBRO:", err.message); // ← ESSENCIAL
    throw err;
  }
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

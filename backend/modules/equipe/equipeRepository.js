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
  return { id: result.insertId };
}

async function updateEquipe(id, dados) {
  try {
    const campos = [];
    const valores = [];

    if (dados.nome) {
      campos.push("nome = ?");
      valores.push(dados.nome);
    }
    if (dados.telefone) {
      campos.push("telefone = ?");
      valores.push(dados.telefone);
    }
    if (dados.whatsapp) {
      campos.push("whatsapp = ?");
      valores.push(dados.whatsapp);
    }
    if (dados.email) {
      campos.push("email = ?");
      valores.push(dados.email);
    }
    if (dados.status) {
      campos.push("status = ?");
      valores.push(dados.status);
    }
    if (dados.observacoes) {
      campos.push("observacoes = ?");
      valores.push(dados.observacoes);
    }
    if (dados.senha_hash) {
      campos.push("senha_hash = ?");
      valores.push(dados.senha_hash);
    }

    // Nada pra atualizar
    if (campos.length === 0) return 0;

    const sql = `UPDATE equipe SET ${campos.join(", ")} WHERE id = ?`;
    valores.push(id);

    const [result] = await db.query(sql, valores);
    return result.affectedRows;
  } catch (err) {
    console.error("❌ ERRO SQL AO ATUALIZAR MEMBRO:", err.message);
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

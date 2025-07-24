const connection = require("../../database/connection");

async function buscarTodasComInstrutor() {
  const [rows] = await connection.execute(`
    SELECT 
      t.id,
      t.nome,
      t.faixa_etaria,
      t.equipe_id,
      e.nome AS nome_instrutor
    FROM turmas t
    JOIN equipe e ON t.equipe_id = e.id
    ORDER BY t.nome ASC
  `);
  return rows;
}

async function inserirTurma({ nome, faixa_etaria, equipe_id }) {
  await connection.execute(`
    INSERT INTO turmas (nome, faixa_etaria, equipe_id)
    VALUES (?, ?, ?)
  `, [nome, faixa_etaria || null, equipe_id]);
}

async function atualizarTurma(id, { nome, faixa_etaria, equipe_id }) {
  await connection.execute(`
    UPDATE turmas
    SET nome = ?, faixa_etaria = ?, equipe_id = ?
    WHERE id = ?
  `, [nome, faixa_etaria || null, equipe_id, id]);
}

async function deletarTurma(id) {
  await connection.execute(`DELETE FROM turmas WHERE id = ?`, [id]);
}

async function listarTurmasPorEquipe(equipe_id) {
  const [rows] = await connection.execute(
    `SELECT id FROM turmas WHERE equipe_id = ?`,
    [equipe_id]
  );
  return rows;
}


module.exports = {
  buscarTodasComInstrutor,
  inserirTurma,
  atualizarTurma,
  deletarTurma,
  listarTurmasPorEquipe
};

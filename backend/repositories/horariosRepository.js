const db = require('../database/connection');

// Buscar todos os horários
async function getHorarios() {
  const [rows] = await db.execute('SELECT * FROM horarios_aula ORDER BY ordem ASC, id ASC');
  return rows;
}

// Buscar um horário específico por ID
async function getHorarioById(id) {
  const [rows] = await db.execute('SELECT * FROM horarios_aula WHERE id = ?', [id]);
  return rows[0];
}

// Criar um novo horário
async function createHorario({ turma, dias, horario, faixa_etaria, ordem = null }) {
  const [result] = await db.execute(
    'INSERT INTO horarios_aula (turma, dias, horario, faixa_etaria, ordem) VALUES (?, ?, ?, ?, ?)',
    [turma, dias, horario, faixa_etaria, ordem]
  );
  return result.insertId;
}

// Atualizar um horário existente
async function updateHorario(id, { turma, dias, horario, faixa_etaria, ordem = null }) {
  await db.execute(
    'UPDATE horarios_aula SET turma = ?, dias = ?, horario = ?, faixa_etaria = ?, ordem = ? WHERE id = ?',
    [turma, dias, horario, faixa_etaria, ordem, id]
  );
}

// Excluir um horário
async function deleteHorario(id) {
  await db.execute('DELETE FROM horarios_aula WHERE id = ?', [id]);
}

module.exports = {
  getHorarios,
  getHorarioById,
  createHorario,
  updateHorario,
  deleteHorario,
};

const db = require('../database/connection');

// Buscar todos os horários
async function getHorarios() {
  const [rows] = await db.execute(
    'SELECT * FROM horarios_aula ORDER BY ordem ASC, id ASC'
  );
  return rows;
}

// Buscar um horário específico por ID
async function getHorarioById(id) {
  const [rows] = await db.execute(
    'SELECT * FROM horarios_aula WHERE id = ?',
    [id]
  );
  return rows[0];
}

// Criar um novo horário
async function createHorario({ turma, dias, horario, faixa_etaria, ordem = null, instrutor = null, whatsapp_instrutor = null }) {
  const [result] = await db.execute(
    'INSERT INTO horarios_aula (turma, dias, horario, faixa_etaria, ordem, instrutor, whatsapp_instrutor) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [turma, dias, horario, faixa_etaria, ordem, instrutor, whatsapp_instrutor]
  );
  return result.insertId;
}

// Atualizar um horário existente
async function updateHorario(id, { turma, dias, horario, faixa_etaria, ordem = null, instrutor = null, whatsapp_instrutor = null }) {
  await db.execute(
    'UPDATE horarios_aula SET turma = ?, dias = ?, horario = ?, faixa_etaria = ?, ordem = ?, instrutor = ?, whatsapp_instrutor = ? WHERE id = ?',
    [turma, dias, horario, faixa_etaria, ordem, instrutor, whatsapp_instrutor, id]
  );
}

// Excluir um horário
async function deleteHorario(id) {
  await db.execute('DELETE FROM horarios_aula WHERE id = ?', [id]);
}

// Atualizar a ordem de múltiplos horários
async function atualizarOrdemHorarios(lista) {
  const conexao = await db.getConnection();
  try {
    await conexao.beginTransaction();

    for (const item of lista) {
      await conexao.execute(
        'UPDATE horarios_aula SET ordem = ? WHERE id = ?',
        [item.ordem, item.id]
      );
    }

    await conexao.commit();
  } catch (err) {
    await conexao.rollback();
    throw err;
  } finally {
    conexao.release();
  }
}


module.exports = {
  getHorarios,
  getHorarioById,
  createHorario,
  updateHorario,
  deleteHorario,
  atualizarOrdemHorarios,
};

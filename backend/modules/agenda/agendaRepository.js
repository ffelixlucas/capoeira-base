const db = require('../../database/connection');

const listarEventos = async () => {
  const [rows] = await db.execute(`
    SELECT * FROM agenda ORDER BY data_inicio ASC
  `);
  return rows;
};

const criarEvento = async (evento) => {
  const {
    titulo,
    descricao_curta,
    descricao_completa,
    local,
    endereco,
    telefone_contato,
    data_inicio,
    data_fim,
    imagem_url,
    criado_por,
  } = evento;

  const [result] = await db.execute(`
    INSERT INTO agenda (
      titulo, descricao_curta, descricao_completa, local, endereco,
      telefone_contato, data_inicio, data_fim, imagem_url, criado_por
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    titulo, descricao_curta, descricao_completa, local, endereco,
    telefone_contato, data_inicio, data_fim, imagem_url, criado_por
  ]);

  return result.insertId;
};

const excluirEvento = async (id) => {
  const [result] = await db.execute(`
    DELETE FROM agenda WHERE id = ?
  `, [id]);

  return result.affectedRows > 0;
};

async function atualizar(id, dados) {
  const [result] = await db.query(
    `UPDATE agenda SET titulo = ?, descricao_curta = ?, descricao_completa = ?, 
    local = ?, endereco = ?, telefone_contato = ?, data_inicio = ?, data_fim = ?, imagem_url = ? 
    WHERE id = ?`,
    [
      dados.titulo,
      dados.descricao_curta,
      dados.descricao_completa,
      dados.local,
      dados.endereco,
      dados.telefone_contato,
      dados.data_inicio,
      dados.data_fim,
      dados.imagem_url,
      id
    ]
  );
  return result;
}

const buscarPorId = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM agenda WHERE id = ?`, [id]);
  return rows[0] || null;
};



module.exports = {
  listarEventos,
  criarEvento,
  excluirEvento,
  atualizar,
  buscarPorId
};

const db = require('../../database/connection');

const listarEventos = async (status) => {
  let query = `
    SELECT 
      id,
      titulo,
      descricao_curta,
      descricao_completa,
      local,
      endereco,
      telefone_contato,
      data_inicio,
      data_fim,
      imagem_url,
      com_inscricao,
      valor,
      responsavel_id,
      configuracoes,
      status,
      criado_em,
      criado_por,
      possui_camiseta
    FROM agenda
  `;

  const params = [];
  if (status) {
    query += ` WHERE status = ?`;
    params.push(status);
  }

  query += ` ORDER BY data_inicio ASC`;

  const [rows] = await db.execute(query, params);

  return rows.map((evento) => ({
    ...evento,
    configuracoes: (() => {
      if (!evento.configuracoes) return {};
      if (typeof evento.configuracoes === "object") return evento.configuracoes;
      try {
        return JSON.parse(evento.configuracoes);
      } catch (err) {
        console.warn(`⚠️ Erro ao parsear configuracoes do evento ${evento.id}`);
        return {};
      }
    })(),
  }));
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
    com_inscricao = false,
    valor = 0,
    responsavel_id = null,
    configuracoes = {},
    criado_por,
    possui_camiseta = false
  } = evento;

  const [result] = await db.execute(`
    INSERT INTO agenda (
      titulo, descricao_curta, descricao_completa, local, endereco,
      telefone_contato, data_inicio, data_fim, imagem_url,
      com_inscricao, valor, responsavel_id, configuracoes, criado_por,
      possui_camiseta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    titulo,
    descricao_curta,
    descricao_completa,
    local,
    endereco,
    telefone_contato,
    data_inicio,
    data_fim,
    imagem_url,
    com_inscricao,
    valor,
    responsavel_id,
    JSON.stringify(configuracoes),
    criado_por,
    possui_camiseta
  ]);

  return result.insertId;
};

const excluirEvento = async (id) => {
  const [result] = await db.execute(`
    DELETE FROM agenda WHERE id = ?
  `, [id]);

  return result.affectedRows > 0;
};

const atualizar = async (id, dados) => {
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
    com_inscricao = false,
    valor = 0,
    responsavel_id = null,
    configuracoes = {},
    possui_camiseta = false
  } = dados;

  const [result] = await db.execute(
    `UPDATE agenda SET 
      titulo = ?, 
      descricao_curta = ?, 
      descricao_completa = ?, 
      local = ?, 
      endereco = ?, 
      telefone_contato = ?, 
      data_inicio = ?, 
      data_fim = ?, 
      imagem_url = ?,
      com_inscricao = ?,
      valor = ?,
      responsavel_id = ?,
      configuracoes = ?,
      possui_camiseta = ?
    WHERE id = ?`,
    [
      titulo,
      descricao_curta,
      descricao_completa,
      local,
      endereco,
      telefone_contato,
      data_inicio,
      data_fim,
      imagem_url,
      com_inscricao,
      valor,
      responsavel_id,
      JSON.stringify(configuracoes),
      possui_camiseta,
      id
    ]
  );

  return result;
};

const buscarPorId = async (id) => {
  const [rows] = await db.execute(`SELECT * FROM agenda WHERE id = ?`, [id]);
  return rows[0] || null;
};

async function atualizarStatus(id, status) {
  const [result] = await db.execute(
    `UPDATE agenda SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  listarEventos,
  criarEvento,
  excluirEvento,
  atualizar,
  buscarPorId,
  atualizarStatus
};

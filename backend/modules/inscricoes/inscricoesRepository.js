const db = require('../../database/connection');

// Lista evento e todos os inscritos de um evento
async function listarPorEvento(eventoId, busca = "") {
  // 1. Buscar os dados do evento
  const [eventoRows] = await db.execute(
    `SELECT id, titulo, valor, data_inicio 
     FROM agenda 
     WHERE id = ?`,
    [eventoId]
  );

  const evento = eventoRows[0];
  if (!evento) {
    return null; // evento não encontrado
  }

  // 2. Buscar total de inscritos SEM filtro
  const [totalRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM inscricoes_evento WHERE evento_id = ?`,
    [eventoId]
  );
  evento.total_inscritos = totalRows[0].total;

  // 3. Buscar os inscritos (APLICANDO o filtro, se houver)
  let query = `
    SELECT 
      id, 
      nome, 
      telefone, 
      status, 
      evento_id,
      email,
      apelido,
      responsavel_nome,
      tamanho_camiseta
    FROM inscricoes_evento
    WHERE evento_id = ?
  `;

  const params = [eventoId];

  if (busca) {
    query += `
      AND (
        nome LIKE ? OR
        apelido LIKE ? OR
        email LIKE ? OR
        telefone LIKE ? OR
        cpf LIKE ?
      )
    `;
    const like = `%${busca}%`;
    params.push(like, like, like, like, like);
  }

  query += " ORDER BY criado_em DESC";

  const [inscritos] = await db.execute(query, params);

  // 4. Retornar objeto com evento + inscritos filtrados
  return { evento, inscritos };
}



// Busca os detalhes completos de um inscrito
async function buscarPorId(id) {
  const [rows] = await db.execute(
    `SELECT * 
     FROM inscricoes_evento
     WHERE id = ?`,
    [id]
  );

  return rows[0] || null;
}

async function criarInscricao(dados) {
  const {
    evento_id,
    nome,
    apelido = null,
    data_nascimento = null,
    email = null,
    telefone = null,
    cpf = null,
    autorizacao_participacao = null,
    autorizacao_imagem = null,
    documento_autorizacao_url = null,
    valor = null,
    responsavel_nome = null,
    responsavel_documento = null,
    responsavel_contato = null,
    responsavel_parentesco = null,
    tamanho_camiseta = null,
    alergias_restricoes = null,
    aceite_imagem = 0,
    aceite_responsabilidade = 0,
    aceite_lgpd = 0
  } = dados;

  if (!evento_id || !nome) {
    throw new Error("Campos obrigatórios: evento_id e nome");
  }

  const [result] = await db.execute(
    `INSERT INTO inscricoes_evento (
      evento_id, nome, apelido, data_nascimento, email, telefone, cpf,
      autorizacao_participacao, autorizacao_imagem, documento_autorizacao_url,
      valor, responsavel_nome, responsavel_documento, responsavel_contato, responsavel_parentesco,
      tamanho_camiseta, alergias_restricoes, aceite_imagem, aceite_responsabilidade, aceite_lgpd, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
    [
      evento_id,
      nome,
      apelido,
      data_nascimento,
      email,
      telefone,
      cpf,
      autorizacao_participacao,
      autorizacao_imagem,
      documento_autorizacao_url,
      valor,
      responsavel_nome,
      responsavel_documento,
      responsavel_contato,
      responsavel_parentesco,
      tamanho_camiseta,
      alergias_restricoes,
      aceite_imagem,
      aceite_responsabilidade,
      aceite_lgpd
    ]
  );

  return { id: result.insertId };
}

// Atualiza os dados de uma inscrição (apenas campos permitidos)
async function atualizarInscricao(id, dados) {
  const campos = Object.keys(dados);
  const valores = Object.values(dados);

  if (campos.length === 0) {
    throw new Error("Nenhum campo válido para atualização");
  }

  const setClause = campos.map(campo => `${campo} = ?`).join(', ');

  const [result] = await db.execute(
    `UPDATE inscricoes_evento 
     SET ${setClause}, atualizado_em = NOW() 
     WHERE id = ?`,
    [...valores, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return buscarPorId(id); // retorna a inscrição atualizada
}

async function atualizarStatus(payload) {
  return { atualizado: true, payload };
}

module.exports = {
  listarPorEvento,
  buscarPorId,
  criarInscricao,
  atualizarStatus,
  atualizarInscricao 
};

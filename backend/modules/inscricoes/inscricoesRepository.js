const db = require('../../database/connection');

// Lista todos os inscritos de um evento
async function listarPorEvento(eventoId) {
  const [rows] = await db.execute(
    `SELECT 
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
     ORDER BY criado_em DESC`,
    [eventoId]
  );

  return rows;
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

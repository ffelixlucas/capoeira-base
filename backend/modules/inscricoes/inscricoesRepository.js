// backend/modules/inscricoes/inscricoesRepository.js

const db = require('../../database/connection');
const { atualizarInscricaoComPix } = require('../public/inscricoes/inscricoesRepository');

// Lista evento, totais e inscritos (com filtro opcional)
async function listarPorEvento(eventoId, busca = "") {
  // 1) Dados do evento
  const [eventoRows] = await db.execute(
    `SELECT id, titulo, valor, data_inicio 
     FROM agenda 
     WHERE id = ?`,
    [eventoId]
  );
  const evento = eventoRows[0];
  if (!evento) return null;

  // 2) Totais gerais de inscritos (independente de filtro)
  const [totalRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM inscricoes_evento WHERE evento_id = ?`,
    [eventoId]
  );
  evento.total_inscritos = totalRows[0]?.total ?? 0;

  // 3) Totais financeiros apenas de pagos
  const [totaisRows] = await db.execute(
    `SELECT 
        COALESCE(SUM(valor_bruto), 0)   AS valor_bruto_total,
        COALESCE(SUM(valor_liquido), 0) AS valor_liquido_total
     FROM inscricoes_evento
     WHERE evento_id = ? AND status = 'pago'`,
    [eventoId]
  );
  evento.valor_bruto_total = Number(totaisRows[0]?.valor_bruto_total ?? 0);
  evento.valor_liquido_total = Number(totaisRows[0]?.valor_liquido_total ?? 0);

  // 4) Lista de inscritos (com filtro - busca)
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

    // 5) Resumo de camisetas (apenas pagos)
    const [camisetasRows] = await db.execute(
      `SELECT tamanho_camiseta AS tamanho, COUNT(*) AS total
       FROM inscricoes_evento
       WHERE evento_id = ? AND status = 'pago'
       GROUP BY tamanho_camiseta
       ORDER BY tamanho_camiseta`,
      [eventoId]
    );
  
    // 6) Retorno padronizado
    return { evento, inscritos, resumo_camisetas: camisetasRows };
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

async function deletarInscricao(id) {
  const [result] = await db.query("DELETE FROM inscricoes_evento WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

// Atualiza inscrição para extornado
async function atualizarInscricaoParaExtornado(id, dados) {
  await db.execute(
    `UPDATE inscricoes_evento
       SET status = 'extornado',
           refund_id = ?,
           refund_valor = ?,
           refund_data = NOW(),
           atualizado_em = NOW()
     WHERE id = ?`,
    [dados.refund_id ?? null, dados.refund_valor ?? null, id]
  );
}

/**
 * Busca inscrição com detalhes do evento
 */
const buscarInscricaoComEvento = async (id) => {
  const [rows] = await db.execute(
    `SELECT 
      i.id,
      i.status,
      i.nome,
      i.apelido,
      i.email,
      i.telefone,
      i.cpf,
      i.data_nascimento,
      i.tamanho_camiseta,
      i.alergias_restricoes,
      i.categoria,
      i.graduacao,
      i.evento_id,
      a.titulo,
      a.descricao_curta,
      a.descricao_completa,
      a.data_inicio,
      a.data_fim,
      a.local,
      a.endereco,
      a.telefone_contato,
      a.valor,
      a.possui_camiseta
    FROM inscricoes_evento i
    JOIN agenda a ON i.evento_id = a.id
    WHERE i.id = ?`,
    [id]
  );
  return rows[0];
};



module.exports = {
  listarPorEvento,
  buscarPorId,
  criarInscricao,
  atualizarInscricao,
  deletarInscricao,
  atualizarInscricaoParaExtornado,
  buscarInscricaoComEvento,
};


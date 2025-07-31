const db = require("../../../database/connection");

/**
 * Busca inscrição pendente por CPF
 */
const buscarInscricaoPendente = async (cpf) => {
  const [rows] = await db.execute(
    `SELECT id, pagamento_id, ticket_url, qr_code_base64, date_of_expiration
     FROM inscricoes_evento 
     WHERE cpf = ? AND status = 'pendente' 
     LIMIT 1`,
    [cpf]
  );
  return rows[0] || null;
};

/**
 * Cria uma inscrição com status = pendente
 */
const criarInscricaoPendente = async (dados) => {
  const {
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
    responsavel_nome,
    responsavel_documento,
    responsavel_contato,
    responsavel_parentesco,
    tamanho_camiseta,
    alergias_restricoes,
    aceite_imagem,
    aceite_responsabilidade,
    aceite_lgpd,
  } = dados;

  const [result] = await db.execute(
    `INSERT INTO inscricoes_evento (
      evento_id, nome, apelido, data_nascimento, email, telefone, cpf,
      autorizacao_participacao, autorizacao_imagem, documento_autorizacao_url,
      responsavel_nome, responsavel_documento, responsavel_contato, responsavel_parentesco,
      tamanho_camiseta, alergias_restricoes, aceite_imagem, aceite_responsabilidade, aceite_lgpd,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,
    [
      evento_id,
      nome,
      apelido || null,
      data_nascimento || null,
      email,
      telefone,
      cpf,
      autorizacao_participacao,
      autorizacao_imagem,
      documento_autorizacao_url || null,
      responsavel_nome || null,
      responsavel_documento || null,
      responsavel_contato || null,
      responsavel_parentesco || null,
      tamanho_camiseta || null,
      alergias_restricoes || null,
      aceite_imagem,
      aceite_responsabilidade,
      aceite_lgpd,
    ]
  );

  return result.insertId;
};

/**
 * Atualiza inscrição com dados do PIX (após gerar pagamento)
 */
const atualizarInscricaoComPix = async (id, pagamento) => {
  await db.execute(
    `UPDATE inscricoes_evento 
     SET pagamento_id = ?, ticket_url = ?, qr_code_base64 = ?, date_of_expiration = ?
     WHERE id = ?`,
    [
      pagamento.pagamento_id,
      pagamento.ticket_url,
      pagamento.qr_code_base64,
      pagamento.date_of_expiration,
      id
    ]
  );
};

/**
 * Atualiza inscrição para pago quando o webhook confirmar
 */
const atualizarInscricaoParaPago = async (id, valor) => {
  await db.execute(
    `UPDATE inscricoes_evento 
     SET status = 'pago', valor = ?, atualizado_em = NOW()
     WHERE id = ?`,
    [valor, id]
  );
};

module.exports = {
  buscarInscricaoPendente,
  criarInscricaoPendente,
  atualizarInscricaoComPix,
  atualizarInscricaoParaPago,
};

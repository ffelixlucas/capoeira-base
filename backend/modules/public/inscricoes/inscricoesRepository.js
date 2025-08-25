const db = require("../../../database/connection");

/**
 * Busca inscrição pendente por CPF
 */
const buscarInscricaoPendente = async (cpf) => {
  const [rows] = await db.execute(
    `SELECT id, pagamento_id, ticket_url, qr_code_base64, qr_code, valor, date_of_expiration
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
    responsavel_nome,
    responsavel_documento,
    responsavel_contato,
    responsavel_parentesco,
    tamanho_camiseta,
    alergias_restricoes,
    aceite_lgpd,
    categoria,
    graduacao,
  } = dados;

  // Valores assumidos
  const autorizacao_participacao = true;
  const autorizacao_imagem = true;
  const aceite_imagem = true;
  const aceite_responsabilidade = true;
  const documento_autorizacao_url = null;

  const [result] = await db.execute(
    `INSERT INTO inscricoes_evento (
      evento_id, nome, apelido, data_nascimento, email, telefone, cpf,
      autorizacao_participacao, autorizacao_imagem, documento_autorizacao_url,
      responsavel_nome, responsavel_documento, responsavel_contato, responsavel_parentesco,
      tamanho_camiseta, alergias_restricoes, categoria, graduacao,
      aceite_imagem, aceite_responsabilidade, aceite_lgpd,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,

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
      categoria || null,
      graduacao || null,
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
     SET pagamento_id = ?, 
         ticket_url = ?, 
         qr_code_base64 = ?, 
         qr_code = ?, 
         valor = ?, 
         date_of_expiration = ?
     WHERE id = ?`,
    [
      pagamento.pagamento_id ?? null,
      pagamento.ticket_url ?? null,
      pagamento.qr_code_base64 ?? null,
      pagamento.qr_code ?? null,
      pagamento.valor ?? null,
      pagamento.date_of_expiration ?? null,
      id,
    ]
  );
};

/**
 * Atualiza inscrição para pago quando o webhook confirmar
 * Salva status, id do pagamento, bruto, líquido e taxas (uma única query)
 */
const atualizarInscricaoParaPago = async (id, dados) => {
  await db.execute(
    `UPDATE inscricoes_evento 
       SET status = 'pago',
           pagamento_id = ?,
           valor_bruto = ?,
           valor_liquido = ?,
           taxa_valor = ?,
           taxa_percentual = ?,
           atualizado_em = NOW()
     WHERE id = ?`,
    [
      dados.pagamento_id ?? null,
      dados.valor_bruto ?? null,
      dados.valor_liquido ?? null,
      dados.taxa_valor ?? null,
      dados.taxa_percentual ?? null,
      id,
    ]
  );
};

/**
 * Atualiza inscrição pendente
 */
const atualizarInscricaoPendente = async (id, dados) => {
  await db.execute(
    `UPDATE inscricoes_evento 
     SET nome = ?, apelido = ?, data_nascimento = ?, email = ?, telefone = ?, 
         responsavel_nome = ?, responsavel_documento = ?, responsavel_contato = ?, 
         responsavel_parentesco = ?, tamanho_camiseta = ?, alergias_restricoes = ?, 
         categoria = ?, graduacao = ?, aceite_lgpd = ?, atualizado_em = NOW()
     WHERE id = ? AND status = 'pendente'`,
    [
      dados.nome,
      dados.apelido || null,
      dados.data_nascimento || null,
      dados.email,
      dados.telefone,
      dados.responsavel_nome || null,
      dados.responsavel_documento || null,
      dados.responsavel_contato || null,
      dados.responsavel_parentesco || null,
      dados.tamanho_camiseta || null,
      dados.alergias_restricoes || null,
      dados.categoria || null,
      dados.graduacao || null,
      dados.aceite_lgpd,
      id,
    ]
  );
};

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

const verificarInscricaoPaga = async (cpf, eventoId) => {
  const [rows] = await db.execute(
    `SELECT id FROM inscricoes_evento
     WHERE cpf = ? AND evento_id = ? AND status = 'pago'
     LIMIT 1`,
    [cpf, eventoId]
  );
  return rows.length > 0;
};

module.exports = {
  buscarInscricaoPendente,
  criarInscricaoPendente,
  atualizarInscricaoComPix,
  atualizarInscricaoParaPago,
  atualizarInscricaoPendente,
  buscarInscricaoComEvento,
  verificarInscricaoPaga,
};

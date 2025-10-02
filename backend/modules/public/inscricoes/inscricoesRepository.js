// backend/modules/public/inscricoes/inscricoesRepository.js

const db = require("../../../database/connection");
const logger = require("../../../utils/logger.js");

/**
 * Busca inscrição pendente por CPF e evento
 */
const buscarInscricaoPendente = async (cpf, eventoId) => {
  const [rows] = await db.execute(
    `SELECT id, pagamento_id, ticket_url, qr_code_base64, qr_code, valor, date_of_expiration
     FROM inscricoes_evento 
     WHERE cpf = ? AND evento_id = ? AND status = 'pendente' 
     LIMIT 1`,
    [cpf, eventoId]
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
    categoria_id,
    graduacao_id,
    metodo_pagamento,
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
      tamanho_camiseta, alergias_restricoes, categoria_id, graduacao_id,
      aceite_imagem, aceite_responsabilidade, aceite_lgpd, metodo_pagamento,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente')`,

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
      categoria_id || null,
      graduacao_id || null,
      aceite_imagem,
      aceite_responsabilidade,
      aceite_lgpd ?? 0,
      metodo_pagamento || null,
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
         date_of_expiration = ?,
         metodo_pagamento = 'pix'
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
  const [result] = await db.execute(
    `UPDATE inscricoes_evento
     SET status = ?, pagamento_id = ?, valor_bruto = ?, valor_liquido = ?, 
         taxa_valor = ?, taxa_percentual = ?, parcelas = ?, metodo_pagamento = ?, 
         bandeira_cartao = ?, atualizado_em = NOW()
     WHERE id = ?`,
    [
      dados.status,
      dados.pagamento_id,
      dados.valor_bruto,
      dados.valor_liquido,
      dados.taxa_valor,
      dados.taxa_percentual,
      dados.parcelas,
      dados.metodo_pagamento,
      dados.bandeira_cartao,
      id,
    ]
  );
  return result;
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
         categoria_id = ?, graduacao_id = ?, aceite_lgpd = ?, 
         status = ?, pagamento_id = ?, metodo_pagamento = ?, 
         bandeira_cartao = ?, parcelas = ?, 
         ticket_url = ?, date_of_expiration = ?, 
         valor_bruto = ?, valor_liquido = ?, taxa_valor = ?, taxa_percentual = ?, 
         atualizado_em = NOW()
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
      dados.categoria_id || null,
      dados.graduacao_id || null,
      dados.aceite_lgpd ?? 0,
      dados.status || "pendente",
      dados.pagamento_id || null,
      dados.metodo_pagamento || "cartao",
      dados.bandeira_cartao || null,
      dados.parcelas || null,
      dados.ticket_url || null,
      dados.date_of_expiration || null,
      dados.valor_bruto || null,
      dados.valor_liquido || null,
      dados.taxa_valor || null,
      dados.taxa_percentual || null,
      id,
    ]
  );
};

/**
 * Busca inscrição com detalhes do evento
 */
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
      i.categoria_id,
      c.nome AS categoria_nome,
      i.graduacao_id,
      g.nome AS graduacao_nome,
      i.evento_id,

      -- 🔥 CAMPOS DE PAGAMENTO
      i.pagamento_id,
      i.metodo_pagamento,
      i.bandeira_cartao,
      i.parcelas,
      i.valor_bruto,
      i.valor_liquido,
      i.taxa_valor,
      i.taxa_percentual,
      i.ticket_url,
      i.qr_code,
      i.qr_code_base64,
      i.date_of_expiration,

      -- EVENTO
      a.titulo,
      a.descricao_curta,
      a.descricao_completa,
      a.data_inicio,
      a.data_fim,
      a.local,
      a.endereco,
      a.telefone_contato,
      a.valor,
      a.possui_camiseta,

      -- gera o código de inscrição
      CONCAT('GCB-', YEAR(CURDATE()), '-EVT', i.evento_id, '-', LPAD(i.id,4,'0')) AS codigo_inscricao

    FROM inscricoes_evento i
    LEFT JOIN agenda a ON i.evento_id = a.id
    LEFT JOIN categorias c ON i.categoria_id = c.id
    LEFT JOIN graduacoes g ON i.graduacao_id = g.id
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

// Busca o valor base do evento na tabela agenda
async function buscarValorEvento(eventoId) {
  logger.debug("[inscricoesRepository.buscarValorEvento] eventoId:", eventoId);

  const [rows] = await db.execute(
    "SELECT id, valor FROM agenda WHERE id = ? LIMIT 1",
    [eventoId]
  );

  const evento = rows[0] || null;

  logger.debug("[inscricoesRepository.buscarValorEvento] resultado:", evento);

  return evento;
}

module.exports = {
  buscarInscricaoPendente,
  criarInscricaoPendente,
  atualizarInscricaoComPix,
  atualizarInscricaoParaPago,
  atualizarInscricaoPendente,
  buscarInscricaoComEvento,
  verificarInscricaoPaga,
  buscarValorEvento,
};

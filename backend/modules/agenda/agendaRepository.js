// backend/modules/agenda/agendaRepository.js
const db = require("../../database/connection");
const logger = require("../../utils/logger.js");

/* -------------------------------------------------------------------------- */
/* 🔍 Listar eventos por organização                                          */
/* -------------------------------------------------------------------------- */
async function listarEventos(organizacaoId, status, situacao) {
  logger.debug("[agendaRepository] Listando eventos", {
    organizacaoId,
    status,
    situacao,
  });

  let sql = `
    SELECT 
      a.id, a.organizacao_id, a.titulo, a.descricao_curta, a.descricao_completa,
      a.local, a.endereco, a.telefone_contato, a.whatsapp_url,
      DATE_FORMAT(a.data_inicio, '%Y-%m-%dT%H:%i:%s.000Z') AS data_inicio,
      DATE_FORMAT(a.data_fim, '%Y-%m-%dT%H:%i:%s.000Z') AS data_fim,
      DATE_FORMAT(a.inscricoes_ate, '%Y-%m-%dT%H:%i:%s.000Z') AS inscricoes_ate,
      a.imagem_url, a.com_inscricao, a.valor, a.responsavel_id,
      a.configuracoes, a.status,
      DATE_FORMAT(a.criado_em, '%Y-%m-%dT%H:%i:%s.000Z') AS criado_em,
      a.criado_por, a.possui_camiseta,
      criador.nome AS criado_por_nome,
      COALESCE(stats.total_inscritos, 0) AS total_inscritos,
      COALESCE(stats.total_pendentes, 0) AS total_pendentes,
      COALESCE(stats.total_extornados, 0) AS total_extornados,
      COALESCE(stats.valor_bruto_total, 0) AS valor_bruto_total,
      COALESCE(stats.valor_liquido_total, 0) AS valor_liquido_total
    FROM agenda a
    LEFT JOIN equipe criador
      ON criador.id = a.criado_por
      AND criador.organizacao_id = a.organizacao_id
    LEFT JOIN (
      SELECT
        ie.evento_id,
        SUM(CASE WHEN ie.status = 'pago' THEN 1 ELSE 0 END) AS total_inscritos,
        SUM(CASE WHEN ie.status = 'pendente' THEN 1 ELSE 0 END) AS total_pendentes,
        SUM(CASE WHEN ie.status = 'extornado' THEN 1 ELSE 0 END) AS total_extornados,
        SUM(CASE WHEN ie.status = 'pago' THEN COALESCE(ie.valor_bruto, 0) ELSE 0 END) AS valor_bruto_total,
        SUM(CASE WHEN ie.status = 'pago' THEN COALESCE(ie.valor_liquido, 0) ELSE 0 END) AS valor_liquido_total
      FROM inscricoes_evento ie
      GROUP BY ie.evento_id
    ) stats ON stats.evento_id = a.id
    WHERE a.organizacao_id = ?
  `;

  const params = [organizacaoId];

  if (status) {
    sql += " AND a.status = ?";
    params.push(status);
  }

  if (situacao === "ativos") {
    sql += " AND NOW() <= COALESCE(a.data_fim, a.data_inicio)";
  } else if (situacao === "concluidos") {
    sql += " AND NOW() > COALESCE(a.data_fim, a.data_inicio)";
  }

  sql += " ORDER BY a.data_inicio ASC";

  const [rows] = await db.execute(sql, params);

  return rows.map((evento) => ({
    ...evento,
    configuracoes: safeJSON(evento.configuracoes),
    total_inscritos: Number(evento.total_inscritos ?? 0),
    total_pendentes: Number(evento.total_pendentes ?? 0),
    total_extornados: Number(evento.total_extornados ?? 0),
    valor_bruto_total: Number(evento.valor_bruto_total ?? 0),
    valor_liquido_total: Number(evento.valor_liquido_total ?? 0),
  }));
}

/* -------------------------------------------------------------------------- */
/* 🧱 Criar evento (multi-org seguro)                                         */
/* -------------------------------------------------------------------------- */
async function criarEvento(evento) {
  const [result] = await db.execute(
    `
    INSERT INTO agenda (
      organizacao_id, titulo, descricao_curta, descricao_completa,
      local, endereco, telefone_contato, whatsapp_url, data_inicio, data_fim,
      inscricoes_ate, imagem_url, com_inscricao, valor, responsavel_id, configuracoes,
      criado_por, possui_camiseta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      evento.organizacao_id,
      evento.titulo,
      evento.descricao_curta,
      evento.descricao_completa,
      evento.local,
      evento.endereco,
      evento.telefone_contato,
      evento.whatsapp_url,
      evento.data_inicio,
      evento.data_fim,
      evento.inscricoes_ate,
      evento.imagem_url,
      evento.com_inscricao,
      evento.valor,
      evento.responsavel_id,
      JSON.stringify(evento.configuracoes || {}),
      evento.criado_por,
      evento.possui_camiseta,
    ]
  );

  logger.debug("[agendaRepository] Evento criado", {
    id: result.insertId,
    organizacao_id: evento.organizacao_id,
  });
  return result.insertId;
}

/* -------------------------------------------------------------------------- */
/* 🔎 Buscar evento por ID (multi-org)                                        */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id, organizacaoId) {
  const [rows] = await db.execute(
    `SELECT
      id, organizacao_id, titulo, descricao_curta, descricao_completa,
      local, endereco, telefone_contato, whatsapp_url,
      DATE_FORMAT(data_inicio, '%Y-%m-%dT%H:%i:%s.000Z') AS data_inicio,
      DATE_FORMAT(data_fim, '%Y-%m-%dT%H:%i:%s.000Z') AS data_fim,
      DATE_FORMAT(inscricoes_ate, '%Y-%m-%dT%H:%i:%s.000Z') AS inscricoes_ate,
      imagem_url, com_inscricao, valor, responsavel_id, configuracoes, status,
      DATE_FORMAT(criado_em, '%Y-%m-%dT%H:%i:%s.000Z') AS criado_em,
      criado_por, possui_camiseta
     FROM agenda
     WHERE id = ? AND organizacao_id = ? LIMIT 1`,
    [id, organizacaoId]
  );
  const evento = rows[0] || null;
  if (evento) evento.configuracoes = safeJSON(evento.configuracoes);
  return evento;
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar evento (multi-org)                                            */
/* -------------------------------------------------------------------------- */
async function atualizar(id, organizacaoId, dados) {
  const sql = `
    UPDATE agenda SET
      titulo = ?, descricao_curta = ?, descricao_completa = ?,
      local = ?, endereco = ?, telefone_contato = ?, whatsapp_url = ?, data_inicio = ?,
      data_fim = ?, inscricoes_ate = ?, imagem_url = ?, com_inscricao = ?, valor = ?,
      responsavel_id = ?, configuracoes = ?, possui_camiseta = ?, status = ?
    WHERE id = ? AND organizacao_id = ?
  `;

  const params = [
    dados.titulo,
    dados.descricao_curta,
    dados.descricao_completa,
    dados.local,
    dados.endereco,
    dados.telefone_contato,
    dados.whatsapp_url,
    dados.data_inicio,
    dados.data_fim,
    dados.inscricoes_ate,
    dados.imagem_url,
    dados.com_inscricao,
    dados.valor,
    dados.responsavel_id,
    JSON.stringify(dados.configuracoes || {}),
    dados.possui_camiseta,
    dados.status || "ativo",
    id,
    organizacaoId,
  ];

  const [result] = await db.execute(sql, params);
  logger.debug("[agendaRepository] Evento atualizado", {
    id,
    organizacaoId,
    linhas: result.affectedRows,
  });
  return result.affectedRows > 0;
}

/* -------------------------------------------------------------------------- */
/* ❌ Excluir evento (multi-org)                                              */
/* -------------------------------------------------------------------------- */
async function excluirEvento(id, organizacaoId) {
  const [result] = await db.execute(
    `DELETE FROM agenda WHERE id = ? AND organizacao_id = ?`,
    [id, organizacaoId]
  );
  logger.debug("[agendaRepository] Evento excluído", {
    id,
    organizacaoId,
    linhas: result.affectedRows,
  });
  return result.affectedRows > 0;
}

/* -------------------------------------------------------------------------- */
/* 🔄 Atualizar status                                                        */
/* -------------------------------------------------------------------------- */
async function atualizarStatus(id, organizacaoId, status) {
  const [result] = await db.execute(
    `UPDATE agenda SET status = ? WHERE id = ? AND organizacao_id = ?`,
    [status, id, organizacaoId]
  );
  logger.debug("[agendaRepository] Status atualizado", {
    id,
    organizacaoId,
    status,
  });
  return result.affectedRows > 0;
}

/* -------------------------------------------------------------------------- */
/* 🧩 Utilitário interno                                                      */
/* -------------------------------------------------------------------------- */
function safeJSON(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

/* -------------------------------------------------------------------------- */
module.exports = {
  listarEventos,
  criarEvento,
  buscarPorId,
  atualizar,
  excluirEvento,
  atualizarStatus,
};

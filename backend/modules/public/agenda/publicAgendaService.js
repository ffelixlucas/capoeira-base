// backend/modules/public/agenda/publicAgendaService.js
const db = require("../../../database/connection");

function normalizarConfiguracoes(configuracoes) {
  if (!configuracoes) return {};
  if (typeof configuracoes === "object") return configuracoes;

  try {
    return JSON.parse(configuracoes);
  } catch {
    return {};
  }
}

/**
 * Lista eventos públicos de uma organização específica (multi-org)
 */
async function listarEventosPublicos(organizacaoId) {
  const [rows] = await db.execute(
    `
    SELECT 
      id, organizacao_id, titulo, descricao_curta, descricao_completa,
      local, endereco, telefone_contato, whatsapp_url,
      DATE_FORMAT(data_inicio, '%Y-%m-%dT%H:%i:%s.000Z') AS data_inicio,
      DATE_FORMAT(data_fim, '%Y-%m-%dT%H:%i:%s.000Z') AS data_fim,
      DATE_FORMAT(inscricoes_ate, '%Y-%m-%dT%H:%i:%s.000Z') AS inscricoes_ate,
      imagem_url, com_inscricao, valor, possui_camiseta,
      configuracoes,
      COALESCE(stats.total_inscritos, 0) AS total_inscritos
    FROM agenda a
    LEFT JOIN (
      SELECT
        ie.evento_id,
        SUM(CASE WHEN ie.status = 'pago' THEN 1 ELSE 0 END) AS total_inscritos
      FROM inscricoes_evento ie
      GROUP BY ie.evento_id
    ) stats ON stats.evento_id = a.id
    WHERE 
      status = 'ativo'
      AND organizacao_id = ?
    ORDER BY data_inicio ASC
    `,
    [organizacaoId]
  );

  return rows.map((evento) => ({
    ...evento,
    configuracoes: normalizarConfiguracoes(evento.configuracoes),
  }));
}

// 🔹 Busca um evento público por ID (mantém igual)
async function buscarEventoPublicoPorId(id, organizacaoId) {
  const [rows] = await db.execute(
    `
    SELECT 
      id, organizacao_id, titulo, descricao_curta, descricao_completa,
      local, endereco, telefone_contato, whatsapp_url,
      DATE_FORMAT(data_inicio, '%Y-%m-%dT%H:%i:%s.000Z') AS data_inicio,
      DATE_FORMAT(data_fim, '%Y-%m-%dT%H:%i:%s.000Z') AS data_fim,
      DATE_FORMAT(inscricoes_ate, '%Y-%m-%dT%H:%i:%s.000Z') AS inscricoes_ate,
      imagem_url, com_inscricao, valor, possui_camiseta,
      configuracoes,
      COALESCE(stats.total_inscritos, 0) AS total_inscritos
    FROM agenda a
    LEFT JOIN (
      SELECT
        ie.evento_id,
        SUM(CASE WHEN ie.status = 'pago' THEN 1 ELSE 0 END) AS total_inscritos
      FROM inscricoes_evento ie
      GROUP BY ie.evento_id
    ) stats ON stats.evento_id = a.id
    WHERE 
      id = ? 
      AND organizacao_id = ? 
      AND status = 'ativo'
    LIMIT 1
    `,
    [id, organizacaoId]
  );

  if (!rows.length) return null;

  const evento = rows[0];
  evento.configuracoes = normalizarConfiguracoes(evento.configuracoes);

  return evento;
}


module.exports = {
  listarEventosPublicos,
  buscarEventoPublicoPorId,
};

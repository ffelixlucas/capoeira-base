// backend/modules/public/agenda/publicAgendaService.js
const db = require("../../../database/connection");

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
      configuracoes
    FROM agenda
    WHERE 
      status = 'ativo'
      AND organizacao_id = ?
    ORDER BY data_inicio ASC
    `,
    [organizacaoId]
  );

  return rows.map((evento) => ({
    ...evento,
    configuracoes: (() => {
      if (!evento.configuracoes) return {};
      if (typeof evento.configuracoes === "object") return evento.configuracoes;
      try {
        return JSON.parse(evento.configuracoes);
      } catch {
        return {};
      }
    })(),
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
      configuracoes
    FROM agenda
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
  try {
    evento.configuracoes = JSON.parse(evento.configuracoes || "{}");
  } catch {
    evento.configuracoes = {};
  }

  return evento;
}


module.exports = {
  listarEventosPublicos,
  buscarEventoPublicoPorId,
};

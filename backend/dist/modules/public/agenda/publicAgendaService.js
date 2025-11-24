// backend/modules/public/agenda/publicAgendaService.js
const db = require("../../../database/connection");
/**
 * Lista eventos públicos de uma organização específica (multi-org)
 */
async function listarEventosPublicos(organizacaoId) {
    const [rows] = await db.execute(`
    SELECT 
      id, organizacao_id, titulo, descricao_curta, descricao_completa,
      local, endereco, telefone_contato,
      data_inicio, data_fim, inscricoes_ate,
      imagem_url, valor, possui_camiseta,
      configuracoes
    FROM agenda
    WHERE 
      com_inscricao = 1 
      AND status = 'ativo'
      AND organizacao_id = ?
    ORDER BY data_inicio ASC
    `, [organizacaoId]);
    return rows.map((evento) => ({
        ...evento,
        configuracoes: (() => {
            if (!evento.configuracoes)
                return {};
            if (typeof evento.configuracoes === "object")
                return evento.configuracoes;
            try {
                return JSON.parse(evento.configuracoes);
            }
            catch {
                return {};
            }
        })(),
    }));
}
// 🔹 Busca um evento público por ID (mantém igual)
async function buscarEventoPublicoPorId(id, organizacaoId) {
    const [rows] = await db.execute(`
    SELECT 
      id, organizacao_id, titulo, descricao_curta, descricao_completa,
      local, endereco, telefone_contato,
      data_inicio, data_fim, inscricoes_ate,
      imagem_url, valor, possui_camiseta,
      configuracoes
    FROM agenda
    WHERE 
      id = ? 
      AND organizacao_id = ? 
      AND com_inscricao = 1 
      AND status = 'ativo'
    LIMIT 1
    `, [id, organizacaoId]);
    if (!rows.length)
        return null;
    const evento = rows[0];
    try {
        evento.configuracoes = JSON.parse(evento.configuracoes || "{}");
    }
    catch {
        evento.configuracoes = {};
    }
    return evento;
}
module.exports = {
    listarEventosPublicos,
    buscarEventoPublicoPorId,
};

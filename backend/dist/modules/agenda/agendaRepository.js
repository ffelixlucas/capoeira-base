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
      id, organizacao_id, titulo, descricao_curta, descricao_completa,
      local, endereco, telefone_contato, data_inicio, data_fim,
      imagem_url, com_inscricao, valor, responsavel_id,
      configuracoes, status, criado_em, criado_por, possui_camiseta
    FROM agenda
    WHERE organizacao_id = ?
  `;
    const params = [organizacaoId];
    if (status) {
        sql += " AND status = ?";
        params.push(status);
    }
    if (situacao === "ativos") {
        sql += " AND NOW() <= COALESCE(data_fim, data_inicio)";
    }
    else if (situacao === "concluidos") {
        sql += " AND NOW() > COALESCE(data_fim, data_inicio)";
    }
    sql += " ORDER BY data_inicio ASC";
    const [rows] = await db.execute(sql, params);
    return rows.map((evento) => ({
        ...evento,
        configuracoes: safeJSON(evento.configuracoes),
    }));
}
/* -------------------------------------------------------------------------- */
/* 🧱 Criar evento (multi-org seguro)                                         */
/* -------------------------------------------------------------------------- */
async function criarEvento(evento) {
    const [result] = await db.execute(`
    INSERT INTO agenda (
      organizacao_id, titulo, descricao_curta, descricao_completa,
      local, endereco, telefone_contato, data_inicio, data_fim,
      imagem_url, com_inscricao, valor, responsavel_id, configuracoes,
      criado_por, possui_camiseta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        evento.organizacao_id,
        evento.titulo,
        evento.descricao_curta,
        evento.descricao_completa,
        evento.local,
        evento.endereco,
        evento.telefone_contato,
        evento.data_inicio,
        evento.data_fim,
        evento.imagem_url,
        evento.com_inscricao,
        evento.valor,
        evento.responsavel_id,
        JSON.stringify(evento.configuracoes || {}),
        evento.criado_por,
        evento.possui_camiseta,
    ]);
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
    const [rows] = await db.execute(`SELECT * FROM agenda WHERE id = ? AND organizacao_id = ? LIMIT 1`, [id, organizacaoId]);
    const evento = rows[0] || null;
    if (evento)
        evento.configuracoes = safeJSON(evento.configuracoes);
    return evento;
}
/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar evento (multi-org)                                            */
/* -------------------------------------------------------------------------- */
async function atualizar(id, organizacaoId, dados) {
    const sql = `
    UPDATE agenda SET
      titulo = ?, descricao_curta = ?, descricao_completa = ?,
      local = ?, endereco = ?, telefone_contato = ?, data_inicio = ?,
      data_fim = ?, imagem_url = ?, com_inscricao = ?, valor = ?,
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
        dados.data_inicio,
        dados.data_fim,
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
    const [result] = await db.execute(`DELETE FROM agenda WHERE id = ? AND organizacao_id = ?`, [id, organizacaoId]);
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
    const [result] = await db.execute(`UPDATE agenda SET status = ? WHERE id = ? AND organizacao_id = ?`, [status, id, organizacaoId]);
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
    if (!value)
        return {};
    if (typeof value === "object")
        return value;
    try {
        return JSON.parse(value);
    }
    catch {
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

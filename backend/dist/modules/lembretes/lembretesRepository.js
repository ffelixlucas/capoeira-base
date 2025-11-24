const db = require('../../database/connection');
// Buscar todos os lembretes
async function listarTodos() {
    const [rows] = await db.query('SELECT * FROM lembretes ORDER BY prioridade DESC, data ASC');
    return rows;
}
// Buscar somente pendentes
async function listarPendentes() {
    const [rows] = await db.query("SELECT * FROM lembretes WHERE status = 'pendente' ORDER BY prioridade DESC, data ASC");
    return rows;
}
// Criar novo lembrete
async function criarLembrete(dados) {
    const { titulo, descricao, prioridade, data, criado_por } = dados;
    const [result] = await db.query(`INSERT INTO lembretes (titulo, descricao, prioridade, data, criado_por)
     VALUES (?, ?, ?, ?, ?)`, [titulo, descricao, prioridade, data, criado_por]);
    return result.insertId;
}
// Atualizar lembrete
async function atualizarLembrete(id, dados) {
    const { titulo, descricao, prioridade, status, data } = dados;
    await db.query(`UPDATE lembretes SET titulo = ?, descricao = ?, prioridade = ?, status = ?, data = ? WHERE id = ?`, [titulo, descricao, prioridade, status, data, id]);
}
// Excluir lembrete
async function excluirLembrete(id) {
    await db.query('DELETE FROM lembretes WHERE id = ?', [id]);
}
module.exports = {
    listarTodos,
    listarPendentes,
    criarLembrete,
    atualizarLembrete,
    excluirLembrete
};

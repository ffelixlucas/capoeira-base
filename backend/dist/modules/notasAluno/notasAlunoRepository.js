// backend/modules/notasAluno/notasAlunoRepository.js
const connection = require("../../database/connection");
async function listarPorAluno(alunoId) {
    const [rows] = await connection.execute("SELECT * FROM notas_aluno WHERE aluno_id = ? ORDER BY criado_em DESC", [alunoId]);
    return rows;
}
async function criar({ aluno_id, equipe_id, texto }) {
    const [res] = await connection.execute(`INSERT INTO notas_aluno (aluno_id, equipe_id, texto) VALUES (?, ?, ?)`, [aluno_id, equipe_id, texto]);
    return {
        id: res.insertId,
        aluno_id,
        equipe_id,
        texto,
        criado_em: new Date(),
    };
}
async function buscarPorId(id) {
    const [rows] = await connection.execute("SELECT * FROM notas_aluno WHERE id = ?", [id]);
    return rows[0];
}
async function excluir(id) {
    await connection.execute("DELETE FROM notas_aluno WHERE id = ?", [id]);
}
module.exports = {
    listarPorAluno,
    criar,
    excluir,
    buscarPorId,
};

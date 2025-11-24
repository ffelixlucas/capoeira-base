// backend/modules/roles/rolesRepository.js
const connection = require('../../database/connection');
const getAllRoles = async () => {
    const [rows] = await connection.query('SELECT * FROM roles ORDER BY nome');
    return rows;
};
const createRole = async ({ nome, descricao }) => {
    const [result] = await connection.query('INSERT INTO roles (nome, descricao) VALUES (?, ?)', [nome, descricao]);
    return { id: result.insertId, nome, descricao };
};
const updateRole = async (id, { nome, descricao }) => {
    await connection.query('UPDATE roles SET nome = ?, descricao = ? WHERE id = ?', [nome, descricao, id]);
};
const deleteRole = async (id) => {
    await connection.query('DELETE FROM roles WHERE id = ?', [id]);
};
const findRoleByName = async (nome) => {
    const [rows] = await connection.query('SELECT * FROM roles WHERE nome = ?', [nome]);
    return rows[0];
};
module.exports = {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
    findRoleByName,
};

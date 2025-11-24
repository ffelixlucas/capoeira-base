// backend/modules/roles/rolesService.js
const rolesRepository = require('./rolesRepository');
const listarRoles = async () => {
    return await rolesRepository.getAllRoles();
};
const criarRole = async ({ nome, descricao }) => {
    if (!nome || nome.trim() === '') {
        throw new Error('O nome do papel é obrigatório.');
    }
    const papelExistente = await rolesRepository.findRoleByName(nome.trim());
    if (papelExistente) {
        throw new Error('Já existe um papel com esse nome.');
    }
    return await rolesRepository.createRole({ nome: nome.trim(), descricao });
};
const atualizarRole = async (id, { nome, descricao }) => {
    if (!nome || nome.trim() === '') {
        throw new Error('O nome do papel é obrigatório.');
    }
    const papelExistente = await rolesRepository.findRoleByName(nome.trim());
    if (papelExistente && papelExistente.id !== parseInt(id)) {
        throw new Error('Outro papel já usa esse nome.');
    }
    await rolesRepository.updateRole(id, { nome: nome.trim(), descricao });
};
const deletarRole = async (id) => {
    await rolesRepository.deleteRole(id);
};
module.exports = {
    listarRoles,
    criarRole,
    atualizarRole,
    deletarRole,
};

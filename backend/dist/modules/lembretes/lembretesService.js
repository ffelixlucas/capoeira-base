const lembretesRepo = require('./lembretesRepository');
// Listar todos ou só pendentes
async function listar(status) {
    if (status === 'pendente') {
        return await lembretesRepo.listarPendentes();
    }
    return await lembretesRepo.listarTodos();
}
// Criar lembrete (validação leve)
async function criar(dados) {
    if (!dados.titulo) {
        throw new Error('Título é obrigatório');
    }
    return await lembretesRepo.criarLembrete(dados);
}
// Editar lembrete
async function atualizar(id, dados) {
    if (!dados.titulo) {
        throw new Error('Título é obrigatório');
    }
    await lembretesRepo.atualizarLembrete(id, dados);
}
// Excluir lembrete
async function remover(id) {
    await lembretesRepo.excluirLembrete(id);
}
module.exports = {
    listar,
    criar,
    atualizar,
    remover
};

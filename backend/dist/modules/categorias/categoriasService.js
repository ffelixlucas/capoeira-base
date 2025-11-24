// modules/categorias/categoriasService.js
const categoriasRepository = require("./categoriasRepository");
const { logger } = require("../../utils/logger.js");
async function listarTodas(organizacaoId) {
    logger.debug("[categoriasService] listarTodas", { organizacaoId });
    return categoriasRepository.listarTodas(organizacaoId);
}
async function criar(dados) {
    logger.info("[categoriasService] criar", dados);
    return categoriasRepository.criar(dados);
}
async function atualizar(id, dados) {
    logger.info("[categoriasService] atualizar", { id, ...dados });
    return categoriasRepository.atualizar(id, dados);
}
async function remover(id, organizacaoId) {
    logger.warn("[categoriasService] remover", { id, organizacaoId });
    return categoriasRepository.remover(id, organizacaoId);
}
async function buscarPorId(id, organizacaoId) {
    logger.debug("[categoriasService] buscarPorId", { id, organizacaoId });
    return categoriasRepository.buscarPorId(id, organizacaoId);
}
async function buscarPorIdade(idade, organizacaoId) {
    logger.debug("[categoriasService] buscarPorIdade", { idade, organizacaoId });
    return categoriasRepository.buscarPorIdade(idade, organizacaoId);
}
module.exports = {
    listarTodas,
    criar,
    atualizar,
    remover,
    buscarPorId,
    buscarPorIdade,
};

// 🎯 Service compartilhado - Organizações
// Responsável por aplicar regras de negócio e validações sobre as organizações
const organizacaoRepository = require("./organizacaoRepository");
const logger = require("../../../utils/logger.js");
/* -------------------------------------------------------------------------- */
/* 🔹 Resolver ID da organização a partir do slug                             */
/* -------------------------------------------------------------------------- */
async function resolverIdPorSlug(slug) {
    try {
        if (!slug)
            throw new Error("Slug da organização não informado.");
        const id = await organizacaoRepository.buscarIdPorSlug(slug);
        if (!id) {
            throw new Error(`Organização não encontrada para o slug "${slug}"`);
        }
        logger.debug(`[organizacaoService] Slug "${slug}" resolvido para org ${id}`);
        return id;
    }
    catch (err) {
        logger.error("[organizacaoService] Erro ao resolver ID por slug:", err.message);
        throw err;
    }
}
/* -------------------------------------------------------------------------- */
/* 🔹 Buscar informações completas da organização                             */
/* -------------------------------------------------------------------------- */
async function buscarPorSlug(slug) {
    try {
        const organizacao = await organizacaoRepository.buscarPorSlug(slug);
        if (!organizacao) {
            throw new Error(`Organização não encontrada para o slug "${slug}"`);
        }
        logger.debug(`[organizacaoService] Organização carregada (slug: ${slug})`);
        return organizacao;
    }
    catch (err) {
        logger.error("[organizacaoService] Erro ao buscar organização:", err.message);
        throw err;
    }
}
/* -------------------------------------------------------------------------- */
/* 🔹 Buscar organização por ID (uso interno)                                 */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id) {
    try {
        const organizacao = await organizacaoRepository.buscarPorId(id);
        if (!organizacao) {
            throw new Error(`Organização não encontrada para o ID ${id}`);
        }
        return organizacao;
    }
    catch (err) {
        logger.error("[organizacaoService] Erro ao buscar organização por ID:", err.message);
        throw err;
    }
}
module.exports = {
    resolverIdPorSlug,
    buscarPorSlug,
    buscarPorId,
};

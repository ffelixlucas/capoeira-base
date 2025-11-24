// modules/notificacaoDestinos/notificacaoDestinosService.js
const repo = require("./notificacaoDestinosRepository");
const logger = require("../../utils/logger.js");
/**
 * Lista e-mails de notificação por tipo (multi-organização)
 */
async function listar(organizacaoId, grupoId, tipo) {
    logger.debug(`[notificacaoDestinosService] org ${organizacaoId} - listando notificações tipo ${tipo}`);
    return await repo.listarPorTipo(organizacaoId, grupoId, tipo);
}
async function adicionar(organizacaoId, grupoId, tipo, email) {
    // 🔥 Caso o front tenha enviado um objeto em vez de string
    const emailFinal = typeof email === "object" ? email.email : email;
    logger.info(`[notificacaoDestinosService] org ${organizacaoId} - adicionando e-mail ${emailFinal} (${tipo})`);
    return await repo.criar(organizacaoId, grupoId, tipo, emailFinal);
}
/**
 * Remove e-mail de notificação
 */
async function deletar(id, organizacaoId) {
    logger.warn(`[notificacaoDestinosService] org ${organizacaoId} - removendo notificação id ${id}`);
    return await repo.remover(id, organizacaoId);
}
/**
 * Retorna apenas lista de e-mails (uso interno em matrículas/eventos/pagamentos)
 */
async function getEmails(organizacaoId, tipo) {
    const tipoFinal = tipo ?? "matricula";
    const orgFinal = organizacaoId ?? null;
    logger.debug(`[notificacaoDestinosService] org ${orgFinal} - buscando e-mails tipo ${tipoFinal}`);
    // Busca todos os e-mails cadastrados para o tipo dentro da org (qualquer grupo)
    const rows = await repo.listarPorTipo(orgFinal, 1, tipoFinal); // ⚠️ grupo_id fixo 1 por padrão
    return rows.map((r) => r.email);
}
module.exports = { listar, adicionar, deletar, getEmails };

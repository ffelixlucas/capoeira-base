// backend/modules/equipeRoles/equipeRolesController.js
const logger = require("../../../utils/logger.js");
const equipeRolesService = require("./equipeRolesService");
/* -------------------------------------------------------------------------- */
/* 🔍 Listar papéis de um membro (multi-org)                                  */
/* -------------------------------------------------------------------------- */
async function listarRoles(req, res) {
    try {
        const { id } = req.params;
        const organizacaoId = req.usuario?.organizacao_id || req.user?.organizacao_id;
        const roles = await equipeRolesService.listarRoles(Number(id), organizacaoId);
        logger.debug("[equipeRolesController] Roles listadas", {
            id,
            organizacaoId,
            total: roles.length,
        });
        res.json(roles);
    }
    catch (error) {
        logger.error("❌ Erro ao listar papéis:", error.message);
        res.status(500).json({ erro: "Erro ao listar papéis." });
    }
}
/* -------------------------------------------------------------------------- */
/* 🧱 Atribuir papel a um membro (multi-org)                                  */
/* -------------------------------------------------------------------------- */
async function adicionarRole(req, res) {
    try {
        const { id } = req.params;
        const { roleId } = req.body;
        const organizacaoId = req.usuario?.organizacao_id || req.user?.organizacao_id;
        logger.log("📥 Requisição recebida para atribuir papel:", {
            id,
            roleId,
            organizacaoId,
        });
        if (!roleId) {
            return res.status(400).json({ erro: "roleId é obrigatório." });
        }
        await equipeRolesService.adicionarRole(Number(id), Number(roleId), organizacaoId);
        res.status(201).json({ mensagem: "Papel atribuído com sucesso." });
    }
    catch (error) {
        logger.error("❌ Erro no adicionarRole:", error.message);
        res.status(400).json({ erro: error.message || "Erro ao atribuir papel." });
    }
}
/* -------------------------------------------------------------------------- */
/* ❌ Remover papel de um membro (multi-org)                                  */
/* -------------------------------------------------------------------------- */
async function removerRole(req, res) {
    try {
        const { id, roleId } = req.params;
        const organizacaoId = req.usuario?.organizacao_id || req.user?.organizacao_id;
        await equipeRolesService.removerRole(Number(id), Number(roleId), organizacaoId);
        res.json({ mensagem: "Papel removido com sucesso." });
    }
    catch (error) {
        logger.error("❌ Erro ao remover papel:", error.message);
        res.status(500).json({ erro: "Erro ao remover papel." });
    }
}
/* -------------------------------------------------------------------------- */
/* 🧹 Remover todos os papéis do membro (multi-org)                           */
/* -------------------------------------------------------------------------- */
async function removerTodosOsRoles(req, res) {
    try {
        const equipeId = Number(req.params.id);
        const organizacaoId = req.usuario?.organizacao_id || req.user?.organizacao_id;
        await equipeRolesService.removerTodosOsRoles(equipeId, organizacaoId);
        logger.debug("[equipeRolesController] Todos os roles removidos", {
            equipeId,
            organizacaoId,
        });
        res.status(204).send(); // No content
    }
    catch (err) {
        logger.error("❌ Erro ao remover papéis do membro:", err.message);
        res.status(500).json({ erro: "Erro ao remover papéis do membro" });
    }
}
/* -------------------------------------------------------------------------- */
module.exports = {
    listarRoles,
    adicionarRole,
    removerRole,
    removerTodosOsRoles,
};

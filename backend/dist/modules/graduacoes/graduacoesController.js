// modules/graduacoes/graduacoesController.js
const graduacoesService = require("./graduacoesService");
const { logger } = require("../../utils/logger.js");
/* -------------------------------------------------------------------------- */
/* 🔍 Listar por categoria                                                    */
/* -------------------------------------------------------------------------- */
async function listarPorCategoria(req, res) {
    try {
        const categoriaId = req.params.categoriaId || req.query.categoria_id;
        const organizacaoId = req.usuario.organizacao_id; // 🔥 multi-org v2
        if (!categoriaId) {
            return res
                .status(400)
                .json({ sucesso: false, erro: "categoria_id é obrigatório" });
        }
        const graduacoes = await graduacoesService.listarPorCategoria(categoriaId, organizacaoId);
        return res.json({ sucesso: true, data: graduacoes });
    }
    catch (err) {
        logger.error("[graduacoesController] listarPorCategoria", err);
        return res.status(500).json({
            sucesso: false,
            erro: "Erro ao buscar graduações",
        });
    }
}
/* -------------------------------------------------------------------------- */
/* 🔍 Listar todas                                                            */
/* -------------------------------------------------------------------------- */
async function listarTodas(req, res) {
    try {
        const organizacaoId = req.usuario.organizacao_id; // 🔥 multi-org v2
        const graduacoes = await graduacoesService.listarTodas(organizacaoId);
        return res.json({ sucesso: true, data: graduacoes });
    }
    catch (err) {
        logger.error("[graduacoesController] listarTodas", err);
        return res.status(500).json({
            sucesso: false,
            erro: "Erro ao buscar graduações",
        });
    }
}
/* -------------------------------------------------------------------------- */
/* ➕ Criar                                                                    */
/* -------------------------------------------------------------------------- */
async function criar(req, res) {
    try {
        const { categoriaId, nome, ordem } = req.body;
        const organizacaoId = req.usuario.organizacao_id; // 🔥 multi-org v2
        if (!categoriaId || !nome || !ordem) {
            return res.status(400).json({
                sucesso: false,
                erro: "categoriaId, nome e ordem são obrigatórios",
            });
        }
        const payload = {
            categoriaId,
            nome,
            ordem,
            organizacaoId,
        };
        const id = await graduacoesService.criar(payload);
        return res.status(201).json({ sucesso: true, id });
    }
    catch (err) {
        logger.error("[graduacoesController] criar", err);
        return res.status(500).json({
            sucesso: false,
            erro: "Erro ao criar graduação",
        });
    }
}
/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar                                                                */
/* -------------------------------------------------------------------------- */
async function atualizar(req, res) {
    try {
        const id = req.params.id;
        const organizacaoId = req.usuario.organizacao_id;
        const { nome, ordem } = req.body;
        const ok = await graduacoesService.atualizar(id, {
            nome,
            ordem,
            organizacaoId,
        });
        if (!ok) {
            return res.status(404).json({
                sucesso: false,
                erro: "Graduação não encontrada",
            });
        }
        return res.json({ sucesso: true });
    }
    catch (err) {
        logger.error("[graduacoesController] atualizar", err);
        return res.status(500).json({
            sucesso: false,
            erro: "Erro ao atualizar graduação",
        });
    }
}
/* -------------------------------------------------------------------------- */
/* ❌ Remover                                                                  */
/* -------------------------------------------------------------------------- */
async function remover(req, res) {
    try {
        const id = req.params.id;
        const organizacaoId = req.usuario.organizacao_id;
        const ok = await graduacoesService.remover(id, organizacaoId);
        if (!ok) {
            return res.status(404).json({
                sucesso: false,
                erro: "Graduação não encontrada",
            });
        }
        return res.json({ sucesso: true });
    }
    catch (err) {
        logger.error("[graduacoesController] remover", err);
        return res.status(500).json({
            sucesso: false,
            erro: "Erro ao remover graduação",
        });
    }
}
/* -------------------------------------------------------------------------- */
/* 🔎 Buscar por ID                                                            */
/* -------------------------------------------------------------------------- */
async function buscarPorId(req, res) {
    try {
        const id = req.params.id;
        const organizacaoId = req.usuario.organizacao_id;
        const graduacao = await graduacoesService.buscarPorId(id, organizacaoId);
        if (!graduacao) {
            return res.status(404).json({
                sucesso: false,
                erro: "Graduação não encontrada",
            });
        }
        return res.json({ sucesso: true, data: graduacao });
    }
    catch (err) {
        logger.error("[graduacoesController] buscarPorId", err);
        return res.status(500).json({
            sucesso: false,
            erro: "Erro ao buscar graduação",
        });
    }
}
module.exports = {
    listarPorCategoria,
    listarTodas,
    criar,
    atualizar,
    remover,
    buscarPorId,
};

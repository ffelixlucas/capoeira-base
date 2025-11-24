// modules/turmas/turmasController.js
const logger = require("../../utils/logger.js");
const turmasService = require("./turmasService");
/* -------------------------------------------------------------------------- */
/* 🔍 Listar turmas ativas da organização                                     */
/* -------------------------------------------------------------------------- */
async function listarTurmasAtivas(req, res) {
    try {
        const orgId = req.usuario.organizacao_id;
        const turmas = await turmasService.listarTurmasAtivas(orgId);
        return res.json(turmas);
    }
    catch (err) {
        logger.error("[turmasController] Erro ao listar turmas", err.message);
        return res.status(500).json({ erro: "Erro ao buscar turmas" });
    }
}
/* -------------------------------------------------------------------------- */
/* 👨‍🏫 Listar turmas do instrutor                                           */
/* -------------------------------------------------------------------------- */
async function listarMinhasTurmas(req, res) {
    try {
        const orgId = req.usuario.organizacao_id;
        const instrutorId = req.usuario.id;
        const turmas = await turmasService.listarTurmasPorEquipe(instrutorId, orgId);
        return res.json(turmas);
    }
    catch (err) {
        return res.status(500).json({ erro: "Erro ao buscar turmas do instrutor" });
    }
}
/* -------------------------------------------------------------------------- */
/* 🎯 Buscar turma pela idade (USO INTERNO — ModalPendentes)                  */
/* -------------------------------------------------------------------------- */
async function buscarTurmaPorIdade(req, res) {
    try {
        const idade = parseInt(req.params.idade, 10);
        const orgId = req.usuario.organizacao_id;
        logger.debug("[turmasController] Buscar turma por idade", { idade, orgId });
        const turma = await turmasService.buscarTurmaPorIdade(idade, orgId);
        if (!turma) {
            return res.json({
                sucesso: true,
                data: null,
                mensagem: "Sem turma disponível para essa faixa etária",
            });
        }
        return res.json({ sucesso: true, data: turma });
    }
    catch (err) {
        logger.error("[turmasController] Erro ao buscar turma por idade", err.message);
        return res.status(500).json({ erro: "Erro ao buscar turma por idade" });
    }
}
/* -------------------------------------------------------------------------- */
/* ➕ Criar nova turma                                                        */
/* -------------------------------------------------------------------------- */
async function criarTurma(req, res) {
    try {
        const orgId = req.usuario.organizacao_id;
        const turma = await turmasService.criarTurma(req.body, orgId);
        return res.status(201).json({ sucesso: true, id: turma.id });
    }
    catch (err) {
        return res.status(500).json({ erro: "Erro ao criar turma" });
    }
}
/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar turma existente                                              */
/* -------------------------------------------------------------------------- */
async function atualizarTurma(req, res) {
    try {
        const orgId = req.usuario.organizacao_id;
        const id = parseInt(req.params.id, 10);
        const atualizado = await turmasService.atualizarTurma(id, req.body, orgId);
        if (!atualizado) {
            return res.status(404).json({ erro: "Turma não encontrada" });
        }
        return res.json({ sucesso: true });
    }
    catch (err) {
        return res.status(500).json({ erro: "Erro ao atualizar turma" });
    }
}
/* -------------------------------------------------------------------------- */
/* ❌ Excluir turma                                                          */
/* -------------------------------------------------------------------------- */
async function excluirTurma(req, res) {
    try {
        const orgId = req.usuario.organizacao_id;
        const id = parseInt(req.params.id, 10);
        const excluida = await turmasService.excluirTurma(id, orgId);
        if (!excluida) {
            return res.status(404).json({ erro: "Turma não encontrada" });
        }
        return res.json({ sucesso: true });
    }
    catch (err) {
        return res.status(500).json({ erro: "Erro ao excluir turma" });
    }
}
/* -------------------------------------------------------------------------- */
/* 🔍 Verificar vínculos                                                     */
/* -------------------------------------------------------------------------- */
async function verificarVinculos(req, res) {
    try {
        const orgId = req.usuario.organizacao_id;
        const possui = await turmasService.verificarVinculos(req.params.id, orgId);
        return res.json({ possui_vinculos: possui });
    }
    catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}
/* -------------------------------------------------------------------------- */
/* 🔁 Encerrar turma                                                         */
/* -------------------------------------------------------------------------- */
async function encerrarTurma(req, res) {
    try {
        const { id } = req.params;
        const { destino_id } = req.body || {};
        const orgId = req.usuario.organizacao_id;
        await turmasService.encerrarTurmaComMigracao(id, destino_id, orgId);
        return res.json({ sucesso: true });
    }
    catch (err) {
        return res.status(500).json({ erro: err.message });
    }
}
module.exports = {
    listarTurmasAtivas,
    listarMinhasTurmas,
    buscarTurmaPorIdade,
    criarTurma,
    atualizarTurma,
    excluirTurma,
    verificarVinculos,
    encerrarTurma,
};

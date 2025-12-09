// alunosController.js
const logger = require("../../utils/logger.js");
const alunoService = require("./alunosService");
const matriculaService = require("../matricula/matriculaService");

/* -------------------------------------------------------------------------- */
/* 🔹 Listar todos os alunos                                                  */
/* -------------------------------------------------------------------------- */
async function listar(req, res) {
  logger.debug("🔍 req.usuario recebido em /alunos:", req.usuario);

  try {
    const usuario = req.usuario;
    const turmaId = req.query.turma_id ? Number(req.query.turma_id) : null;

    const organizacaoId = usuario.organizacao_id;
    if (!organizacaoId) {
      return res.status(403).json({
        erro: "Organização não identificada no token.",
      });
    }

    const alunos = await alunoService.listarTodos(
      usuario,
      turmaId,
      organizacaoId
    );

    return res.json(alunos);
  } catch (err) {
    logger.error("[alunosController] Erro ao listar alunos:", err);
    return res.status(500).json({ erro: "Erro ao buscar alunos." });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar aluno por ID                                                     */
/* -------------------------------------------------------------------------- */
async function buscar(req, res) {
  try {
    const usuario = req.usuario || req.user;
    const organizacaoId = usuario.organizacao_id;
    const { id } = req.params;

    const aluno = await alunoService.buscarPorId(id, organizacaoId);

    logger.info(
      `[alunosController] Aluno carregado com sucesso (ID: ${id}, org: ${organizacaoId})`
    );

    return res.status(200).json(aluno);
  } catch (err) {
    logger.error(`[alunosController] Erro ao buscar aluno: ${err.message}`);
    return res
      .status(404)
      .json({ erro: err.message || "Aluno não encontrado." });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Editar aluno                                                            */
/* -------------------------------------------------------------------------- */
async function editar(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;

    await alunoService.editarAluno(req.params.id, req.body, organizacaoId);

    return res.json({ sucesso: true });
  } catch (err) {
    logger.error("[alunosController] Erro ao editar aluno:", err);
    return res.status(400).json({ erro: err.message });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Excluir aluno                                                           */
/* -------------------------------------------------------------------------- */
async function excluir(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;

    await alunoService.deletarAluno(req.params.id, organizacaoId);

    return res.json({ sucesso: true });
  } catch (err) {
    logger.error("[alunosController] Erro ao excluir aluno:", err);
    return res.status(400).json({ erro: err.message });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Trocar turma                                                            */
/* -------------------------------------------------------------------------- */
async function trocarTurma(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;

    const { nova_turma_id } = req.body;
    if (!nova_turma_id) {
      return res.status(400).json({ erro: "Nova turma obrigatória." });
    }

    await alunoService.trocarTurma(
      req.params.id,
      nova_turma_id,
      organizacaoId
    );

    return res.json({ sucesso: true });
  } catch (err) {
    logger.error("[alunosController] Erro ao trocar turma:", err);
    return res.status(400).json({ erro: err.message });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Métricas individuais do aluno                                           */
/* -------------------------------------------------------------------------- */
async function metricasAluno(req, res) {
  try {
    const usuario = req.usuario || req.user;
    const organizacaoId = usuario.organizacao_id;

    const { id } = req.params;
    let { inicio, fim } = req.query;

    const hoje = new Date().toISOString().split("T")[0];
    if (!inicio) inicio = `${new Date().getFullYear()}-01-01`;
    if (!fim) fim = hoje;

    const metricas = await alunoService.metricasAluno(
      Number(id),
      inicio,
      fim,
      organizacaoId
    );

    return res.json(metricas);
  } catch (err) {
    logger.error("[alunosController] Erro ao buscar métricas:", err);
    return res.status(400).json({ erro: err.message });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Pendentes: contar / listar / atualizar status                           */
/* -------------------------------------------------------------------------- */
async function contarPendentes(req, res) {
  try {
    const usuario = req.usuario;
    const total = await alunoService.contarPendentes(usuario.organizacao_id);

    return res.json({ count: total });
  } catch (err) {
    logger.error("Erro ao contar pendentes:", err);
    return res.status(500).json({ erro: "Erro ao contar pendentes." });
  }
}

async function listarPendentes(req, res) {
  try {
    const usuario = req.usuario;

    const pendentes = await alunoService.listarPendentes(
      usuario.organizacao_id
    );

    return res.json(pendentes);
  } catch (err) {
    logger.error("Erro ao listar pendentes:", err);
    return res.status(500).json({ erro: "Erro ao listar pendentes." });
  }
}

async function atualizarStatus(req, res) {
  try {
    const usuario = req.usuario;
    const { status } = req.body;

    if (!["ativo", "inativo", "pendente"].includes(status)) {
      return res.status(400).json({ erro: "Status inválido." });
    }

    await alunoService.atualizarStatus(
      req.params.id,
      status,
      usuario.organizacao_id
    );

    return res.json({ sucesso: true });
  } catch (err) {
    logger.error("Erro ao atualizar status:", err);
    return res.status(400).json({ erro: err.message });
  }
}

/* -------------------------------------------------------------------------- */

module.exports = {
  listar,
  buscar,
  editar,
  excluir,
  trocarTurma,
  metricasAluno,
  contarPendentes,
  listarPendentes,
  atualizarStatus,
};

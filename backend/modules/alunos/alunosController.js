// alunosController.js
const logger = require("../../utils/logger.js");
const alunoService = require("./alunosService");
const matriculaService = require("../matricula/matriculaService");
const {
  registrarAuditoria,
  listarAuditoriaPorOrganizacao,
} = require("../../utils/auditoriaAtividades");

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
    await registrarAuditoria({
      organizacaoId,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome || null,
      acao: "aluno_turma_trocada",
      entidade: "aluno",
      entidadeId: req.params.id,
      descricao: `Trocou aluno #${req.params.id} para turma #${nova_turma_id}`,
    });

    return res.json({ sucesso: true });
  } catch (err) {
    logger.error("[alunosController] Erro ao trocar turma:", err);
    return res.status(400).json({ erro: err.message });
  }
}

async function solicitarTransferenciaTurma(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;
    const alunoId = Number(req.params.id);
    const { turma_origem_id, turma_destino_id, observacao } = req.body || {};

    const transferenciaId = await alunoService.solicitarTransferenciaTurma({
      alunoId,
      turmaOrigemId: Number(turma_origem_id),
      turmaDestinoId: Number(turma_destino_id),
      organizacaoId,
      solicitadoPor: usuario.id,
      observacao: observacao || null,
    });
    await registrarAuditoria({
      organizacaoId,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome || null,
      acao: "transferencia_solicitada",
      entidade: "transferencia_turma",
      entidadeId: transferenciaId,
      descricao: `Solicitou transferência do aluno #${alunoId}`,
      metadata: { transferencia_id: transferenciaId, status: "pendente" },
    });

    return res.status(201).json({ sucesso: true, transferencia_id: transferenciaId });
  } catch (err) {
    logger.error("[alunosController] Erro ao solicitar transferência:", err);
    return res.status(400).json({ erro: err.message });
  }
}

async function listarTransferenciasPendentes(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;
    const turmaId = req.query.turma_id ? Number(req.query.turma_id) : null;
    const itens = await alunoService.listarTransferenciasPendentes(
      organizacaoId,
      usuario,
      turmaId
    );
    return res.json(itens);
  } catch (err) {
    logger.error("[alunosController] Erro ao listar transferências pendentes:", err);
    return res.status(400).json({ erro: err.message });
  }
}

async function listarTransferenciasRecentes(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const itens = await alunoService.listarTransferenciasRecentes(
      organizacaoId,
      usuario,
      limit
    );
    return res.json(itens);
  } catch (err) {
    logger.error("[alunosController] Erro ao listar transferências recentes:", err);
    return res.status(400).json({ erro: err.message });
  }
}

async function confirmarTransferencia(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;
    const transferenciaId = Number(req.params.transferenciaId);

    await alunoService.confirmarTransferencia({
      transferenciaId,
      organizacaoId,
      usuario,
    });
    await registrarAuditoria({
      organizacaoId,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome || null,
      acao: "transferencia_confirmada",
      entidade: "transferencia_turma",
      entidadeId: transferenciaId,
      descricao: `Confirmou transferência #${transferenciaId}`,
      metadata: { transferencia_id: transferenciaId, status: "confirmada" },
    });

    return res.json({ sucesso: true });
  } catch (err) {
    logger.error("[alunosController] Erro ao confirmar transferência:", err);
    return res.status(400).json({ erro: err.message });
  }
}

async function desfazerTransferencia(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;
    const transferenciaId = Number(req.params.transferenciaId);

    await alunoService.desfazerTransferencia({
      transferenciaId,
      organizacaoId,
      usuario,
    });
    await registrarAuditoria({
      organizacaoId,
      usuarioId: usuario.id,
      usuarioNome: usuario.nome || null,
      acao: "transferencia_cancelada",
      entidade: "transferencia_turma",
      entidadeId: transferenciaId,
      descricao: `Desfez/cancelou transferência #${transferenciaId}`,
      metadata: { transferencia_id: transferenciaId, status: "cancelada" },
    });

    return res.json({ sucesso: true });
  } catch (err) {
    logger.error("[alunosController] Erro ao desfazer transferência:", err);
    return res.status(400).json({ erro: err.message });
  }
}

async function listarAuditoriaAtividades(req, res) {
  try {
    const organizacaoId = req.usuario?.organizacao_id;
    const limit = req.query.limit ? Number(req.query.limit) : 120;
    const itens = await listarAuditoriaPorOrganizacao(organizacaoId, limit);
    return res.json(itens);
  } catch (err) {
    logger.error("[alunosController] Erro ao listar auditoria:", err);
    return res.status(500).json({ erro: "Erro ao listar auditoria." });
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

async function metricasLote(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;

    const { ids, inicio, fim } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ erro: "IDs inválidos." });
    }

    const metricas = await alunoService.metricasAlunosLote(
      ids,
      inicio,
      fim,
      organizacaoId
    );

    return res.json(metricas);
  } catch (err) {
    logger.error("[alunosController] Erro métricas lote:", err);
    return res.status(400).json({ erro: err.message });
  }
}

module.exports = {
  listar,
  buscar,
  editar,
  excluir,
  trocarTurma,
  solicitarTransferenciaTurma,
  listarTransferenciasPendentes,
  listarTransferenciasRecentes,
  confirmarTransferencia,
  desfazerTransferencia,
  listarAuditoriaAtividades,
  metricasAluno,
  contarPendentes,
  listarPendentes,
  atualizarStatus,
  metricasLote
};

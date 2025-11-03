// alunosController.js
const logger = require("../../utils/logger");
const alunoService = require("./alunosService");

/* -------------------------------------------------------------------------- */
/* 🔹 Listar todos os alunos                                                  */
/* -------------------------------------------------------------------------- */
async function listar(req, res) {
  logger.debug("🔍 req.usuario recebido em /alunos:", req.usuario);

  try {
    const usuario = req.usuario; // vem do verifyToken
    const turmaId = req.query.turma_id ? Number(req.query.turma_id) : null;

    // 🔒 injeta organizacao_id do token (multi-org)
    const organizacaoId = usuario.organizacao_id;
    if (!organizacaoId)
      return res
        .status(403)
        .json({ erro: "Organização não identificada no token." });

    const alunos = await alunoService.listarTodos(
      usuario,
      turmaId,
      organizacaoId
    );

    res.json(alunos);
  } catch (err) {
    logger.error("Erro ao listar alunos:", err);
    res.status(500).json({ erro: "Erro ao buscar alunos." });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar aluno por ID                                                     */
/* -------------------------------------------------------------------------- */
async function buscar(req, res) {
  const usuario = req.usuario || req.user;
  const organizacaoId = usuario.organizacao_id;

  const aluno = await alunoService.buscarPorId(req.params.id, organizacaoId);
  res.json(aluno);
}


/* -------------------------------------------------------------------------- */
/* 🔹 Cadastrar novo aluno                                                    */
/* -------------------------------------------------------------------------- */
async function cadastrar(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;

    const dados = { ...req.body, organizacao_id: organizacaoId };

    const alunoId = await alunoService.cadastrarAluno(dados);
    res.status(201).json({ id: alunoId });
  } catch (err) {
    logger.error("Erro ao cadastrar aluno:", err);
    res.status(400).json({ erro: err.message });
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
    res.json({ sucesso: true });
  } catch (err) {
    logger.error("Erro ao editar aluno:", err);
    res.status(400).json({ erro: err.message });
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
    res.json({ sucesso: true });
  } catch (err) {
    logger.error("Erro ao excluir aluno:", err);
    res.status(400).json({ erro: err.message });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Trocar turma do aluno                                                   */
/* -------------------------------------------------------------------------- */
async function trocarTurma(req, res) {
  try {
    const usuario = req.usuario;
    const organizacaoId = usuario.organizacao_id;

    const { nova_turma_id } = req.body;
    if (!nova_turma_id) throw new Error("Nova turma obrigatória.");

    await alunoService.trocarTurma(req.params.id, nova_turma_id, organizacaoId);
    res.json({ sucesso: true });
  } catch (err) {
    logger.error("Erro ao trocar turma:", err);
    res.status(400).json({ erro: err.message });
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

    res.json(metricas);
  } catch (err) {
    logger.error("Erro ao buscar métricas do aluno:", err);
    res.status(400).json({ erro: err.message });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Contar pendentes / listar pendentes / atualizar status                  */
/* -------------------------------------------------------------------------- */
async function contarPendentes(req, res) {
  try {
    const usuario = req.usuario;
    const total = await alunoService.contarPendentes(usuario.organizacao_id);
    res.json({ count: total });
  } catch (err) {
    logger.error("Erro ao contar alunos pendentes:", err);
    res.status(500).json({ erro: "Erro ao contar alunos pendentes." });
  }
}

async function listarPendentes(req, res) {
  try {
    const usuario = req.usuario;
    const pendentes = await alunoService.listarPendentes(
      usuario.organizacao_id
    );
    res.json(pendentes);
  } catch (err) {
    logger.error("Erro ao listar alunos pendentes:", err);
    res.status(500).json({ erro: "Erro ao listar pendentes." });
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
    res.json({ sucesso: true });
  } catch (err) {
    logger.error("Erro ao atualizar status do aluno:", err);
    res.status(400).json({ erro: err.message });
  }
}

module.exports = {
  listar,
  buscar,
  cadastrar,
  editar,
  excluir,
  trocarTurma,
  metricasAluno,
  contarPendentes,
  listarPendentes,
  atualizarStatus,
};

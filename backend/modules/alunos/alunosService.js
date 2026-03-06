const alunoRepo = require("./alunosRepository");
const turmaRepo = require("../turmas/turmasRepository");
const logger = require("../../utils/logger.js");


/* -------------------------------------------------------------------------- */
/* 🔹 Listar todos os alunos (multi-org)                                      */
/* -------------------------------------------------------------------------- */
async function listarTodos(usuario, turmaId = null, organizacaoId) {
  if (!organizacaoId) throw new Error("Organização não informada.");

  if (usuario.roles.includes("admin")) {
    if (turmaId) {
      return await alunoRepo.listarAlunosPorTurmas([turmaId], organizacaoId);
    }
    return await alunoRepo.listarAlunosComTurmaAtual(organizacaoId);
  }
const turmas = await turmaRepo.listarPorEquipe(usuario.id, organizacaoId);

  if (!turmas || turmas.length === 0) return [];

  const turmaIds = turmas.map((t) => t.id);

  if (turmaId) {
    if (!turmaIds.includes(Number(turmaId))) return [];
    return await alunoRepo.listarAlunosPorTurmas([turmaId], organizacaoId);
  }

  return await alunoRepo.listarAlunosPorTurmas(turmaIds, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar aluno por ID                                                     */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id, organizacaoId) {
  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);

  if (!aluno) {
    throw new Error("Aluno não encontrado ou não pertence à sua organização.");
  }

  return aluno;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Editar aluno                                                            */
/* -------------------------------------------------------------------------- */
async function editarAluno(id, dados, organizacaoId) {
  logger.debug("[alunosService] editarAluno chamado", {
    alunoId: id,
    organizacaoId,
    chavesRecebidas: Object.keys(dados),
    temImagemBase64: !!dados.imagemBase64,
  });

  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado.");

  await alunoRepo.editarAluno(id, dados, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔹 Deletar aluno                                                           */
/* -------------------------------------------------------------------------- */
async function deletarAluno(id, organizacaoId) {
  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado.");

  await alunoRepo.excluirAluno(id, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔹 Trocar turma                                                            */
/* -------------------------------------------------------------------------- */
async function trocarTurma(id, novaTurmaId, organizacaoId) {
  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado.");

  await alunoRepo.trocarTurma(id, novaTurmaId, organizacaoId);
}

async function solicitarTransferenciaTurma({
  alunoId,
  turmaOrigemId,
  turmaDestinoId,
  organizacaoId,
  solicitadoPor,
  observacao,
}) {
  const aluno = await alunoRepo.buscarPorId(alunoId, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado.");

  if (!turmaOrigemId || !turmaDestinoId) {
    throw new Error("Turma de origem e destino são obrigatórias.");
  }
  if (Number(turmaOrigemId) === Number(turmaDestinoId)) {
    throw new Error("A turma de destino deve ser diferente da turma de origem.");
  }
  if (Number(aluno.turma_id) !== Number(turmaOrigemId)) {
    throw new Error("O aluno não está mais na turma de origem informada.");
  }

  return await alunoRepo.criarSolicitacaoTransferencia(
    alunoId,
    turmaOrigemId,
    turmaDestinoId,
    organizacaoId,
    solicitadoPor,
    observacao
  );
}

async function listarTransferenciasPendentes(organizacaoId, usuario, turmaId = null) {
  const rows = await alunoRepo.listarTransferenciasPendentes(organizacaoId, turmaId);

  if (usuario.roles.includes("admin")) {
    return rows;
  }

  return rows.filter((row) => Number(row.turma_destino_equipe_id) === Number(usuario.id));
}

async function listarTransferenciasRecentes(organizacaoId, usuario, limit = 10) {
  const rows = await alunoRepo.listarTransferenciasRecentes(organizacaoId, limit);

  if (usuario.roles.includes("admin")) {
    return rows;
  }

  return rows.filter(
    (row) =>
      Number(row.solicitado_por) === Number(usuario.id) ||
      Number(row.confirmado_por) === Number(usuario.id)
  );
}

async function confirmarTransferencia({ transferenciaId, organizacaoId, usuario }) {
  const transferencia = await alunoRepo.buscarTransferenciaPorId(
    transferenciaId,
    organizacaoId
  );

  if (!transferencia) throw new Error("Transferência não encontrada.");
  if (transferencia.status !== "pendente") {
    throw new Error("Esta transferência já foi processada.");
  }

  const podeConfirmar =
    usuario.roles.includes("admin") ||
    Number(transferencia.turma_destino_equipe_id) === Number(usuario.id);

  if (!podeConfirmar) {
    throw new Error("Você não pode confirmar esta transferência.");
  }

  await alunoRepo.trocarTurma(
    transferencia.aluno_id,
    transferencia.turma_destino_id,
    organizacaoId
  );
  await alunoRepo.confirmarTransferencia(
    transferenciaId,
    organizacaoId,
    usuario.id
  );
}

async function desfazerTransferencia({ transferenciaId, organizacaoId, usuario }) {
  if (!usuario.roles.includes("admin")) {
    throw new Error("Somente admin pode desfazer transferências.");
  }

  const transferencia = await alunoRepo.buscarTransferenciaPorId(
    transferenciaId,
    organizacaoId
  );
  if (!transferencia) throw new Error("Transferência não encontrada.");
  if (!["pendente", "confirmada"].includes(transferencia.status)) {
    throw new Error("Apenas transferências pendentes ou confirmadas podem ser desfeitas.");
  }

  if (transferencia.status === "confirmada") {
    const aluno = await alunoRepo.buscarPorId(transferencia.aluno_id, organizacaoId);
    if (!aluno) throw new Error("Aluno não encontrado.");
    if (Number(aluno.turma_id) !== Number(transferencia.turma_destino_id)) {
      throw new Error(
        "Não foi possível desfazer automaticamente: o aluno já está em outra turma."
      );
    }

    await alunoRepo.trocarTurma(
      transferencia.aluno_id,
      transferencia.turma_origem_id,
      organizacaoId
    );
  }

  await alunoRepo.cancelarTransferencia(
    transferenciaId,
    organizacaoId,
    usuario.id,
    transferencia.status
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 Métricas individuais                                                    */
/* -------------------------------------------------------------------------- */
async function metricasAluno(id, inicio, fim, organizacaoId) {
  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado.");

  const hoje = new Date().toISOString().split("T")[0];
  if (!inicio) inicio = `${new Date().getFullYear()}-01-01`;
  if (!fim) fim = hoje;

  const metricas = await alunoRepo.metricasAluno(
    id,
    inicio,
    fim,
    organizacaoId
  );
  const taxa_presenca =
    metricas.total > 0 ? metricas.presentes / metricas.total : 0;

  return {
    ...metricas,
    taxa_presenca: +taxa_presenca.toFixed(2),
  };
}

/* -------------------------------------------------------------------------- */
/* 🔹 Pendentes / Aprovação                                                   */
/* -------------------------------------------------------------------------- */
async function contarPendentes(organizacaoId) {
  return await alunoRepo.contarPendentes(organizacaoId);
}

async function listarPendentes(organizacaoId) {
  return await alunoRepo.listarPendentes(organizacaoId);
}

async function atualizarStatus(id, status, organizacaoId) {
  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado.");

  if (status === "inativo") {
    await alunoRepo.excluirAluno(id, organizacaoId);
  } else {
    await alunoRepo.atualizarStatus(id, status, organizacaoId);
  }
}

async function metricasAlunosLote(alunoIds, inicio, fim, organizacaoId) {
  const hoje = new Date().toISOString().split("T")[0];
  if (!inicio) inicio = `${new Date().getFullYear()}-01-01`;
  if (!fim) fim = hoje;

  return await alunoRepo.metricasAlunosLote(
    alunoIds,
    inicio,
    fim,
    organizacaoId
  );
}

module.exports = {
  listarTodos,
  buscarPorId,
  editarAluno,
  deletarAluno,
  trocarTurma,
  solicitarTransferenciaTurma,
  listarTransferenciasPendentes,
  listarTransferenciasRecentes,
  confirmarTransferencia,
  desfazerTransferencia,
  metricasAluno,
  contarPendentes,
  listarPendentes,
  atualizarStatus,
  metricasAlunosLote
};

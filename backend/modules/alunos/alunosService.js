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

module.exports = {
  listarTodos,
  buscarPorId,
  editarAluno,
  deletarAluno,
  trocarTurma,
  metricasAluno,
  contarPendentes,
  listarPendentes,
  atualizarStatus,
};

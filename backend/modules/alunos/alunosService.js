// alunosService.js
const alunoRepo = require("./alunosRepository");
const turmaRepo = require("../turmas/turmasRepository");

/* -------------------------------------------------------------------------- */
/* 🔹 Listar todos os alunos (multi-org)                                      */
/* -------------------------------------------------------------------------- */
async function listarTodos(usuario, turmaId = null, organizacaoId) {
  if (!organizacaoId) throw new Error("Organização não informada.");

  // Admin → pode ver todos os alunos da própria organização
  if (usuario.roles.includes("admin")) {
    if (turmaId) {
      return await alunoRepo.listarAlunosPorTurmas([turmaId], organizacaoId);
    }
    return await alunoRepo.listarAlunosComTurmaAtual(organizacaoId);
  }

  // Instrutor → vê apenas suas turmas
  const turmas = await turmaRepo.listarTurmasPorEquipe(usuario.id);
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
  if (!aluno) throw new Error("Aluno não encontrado ou não pertence à sua organização.");
  return aluno;
}


/* -------------------------------------------------------------------------- */
/* 🔹 Cadastrar novo aluno                                                    */
/* -------------------------------------------------------------------------- */
async function cadastrarAluno(dados) {
  if (!dados.organizacao_id) throw new Error("Organização obrigatória.");

  const alunoId = await alunoRepo.criarAluno(dados);
  if (!dados.turma_id) throw new Error("Turma obrigatória");

  await alunoRepo.trocarTurma(alunoId, dados.turma_id, dados.organizacao_id);
  return alunoId;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Editar aluno                                                            */
/* -------------------------------------------------------------------------- */
async function editarAluno(id, dados, organizacaoId) {
  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado ou fora da sua organização.");

  await alunoRepo.editarAluno(id, dados, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔹 Deletar aluno                                                           */
/* -------------------------------------------------------------------------- */
async function deletarAluno(id, organizacaoId) {
  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado ou fora da sua organização.");

  await alunoRepo.excluirAluno(id, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔹 Trocar turma                                                            */
/* -------------------------------------------------------------------------- */
async function trocarTurma(id, novaTurmaId, organizacaoId) {
  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado ou fora da sua organização.");

  await alunoRepo.trocarTurma(id, novaTurmaId, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔹 Métricas individuais                                                    */
/* -------------------------------------------------------------------------- */
async function metricasAluno(id, inicio, fim, organizacaoId) {
  const aluno = await alunoRepo.buscarPorId(id, organizacaoId);
  if (!aluno) throw new Error("Aluno não encontrado ou fora da sua organização.");

  const hoje = new Date().toISOString().split("T")[0];
  if (!inicio) inicio = `${new Date().getFullYear()}-01-01`;
  if (!fim) fim = hoje;

  const metricas = await alunoRepo.metricasAluno(id, inicio, fim, organizacaoId);
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
  if (!aluno) throw new Error("Aluno não encontrado ou fora da sua organização.");

  if (status === "inativo") {
    await alunoRepo.excluirAluno(id, organizacaoId);
  } else {
    await alunoRepo.atualizarStatus(id, status, organizacaoId);
  }
}

module.exports = {
  listarTodos,
  buscarPorId,
  cadastrarAluno,
  editarAluno,
  deletarAluno,
  trocarTurma,
  metricasAluno,
  contarPendentes,
  listarPendentes,
  atualizarStatus,
};

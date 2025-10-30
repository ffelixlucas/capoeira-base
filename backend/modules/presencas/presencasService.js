const repo = require("./presencasRepository");

/** Helpers */
function httpError(message, status) {
  const e = new Error(message);
  e.status = status;
  return e;
}
function roleOf(user) {
  return user?.role?.toString?.().toLowerCase?.() || "";
}
function isAdmin(user) {
  return roleOf(user) === "admin";
}
function isInstrutor(user) {
  return roleOf(user) === "instrutor";
}
async function ensurePermissao(user, turmaId) {
  if (isInstrutor(user)) {
    const ok = await repo.instrutorPossuiTurma(user.id, turmaId);
    if (!ok) throw httpError("Sem permissão para esta turma", 403);
  }
}

/** Listagem por turma e data (dia) */
exports.listarPorTurmaEData = async ({ user, turma_id, data }) => {
  await ensurePermissao(user, turma_id);
  const presencas = await repo.listarPorTurmaEData(turma_id, data);
  return { turma_id, data, presencas };
};

/** Upsert em lote (batch) */
exports.salvarBatch = async ({ user, turma_id, data, itens }) => {
  await ensurePermissao(user, turma_id);

  if (!Array.isArray(itens) || itens.length === 0) {
    throw httpError("itens[] é obrigatório", 400);
  }

  const alunoIds = itens.map((i) => Number(i.aluno_id)).filter(Boolean);

  const fora = await repo.alunosForaDaTurma(Number(turma_id), alunoIds);

  if (fora.length) {
    throw httpError(
      `Alunos fora da turma ${turma_id}: ${fora.join(", ")}`,
      400
    );
  }

  const linhas = itens.map((i) => ({
    aluno_id: Number(i.aluno_id),
    turma_id: Number(turma_id),
    data,
    status: i.status === "presente" ? "presente" : "falta",
    created_by: user?.id || null,
    organizacao_id: user?.organizacao_id || null, // 🔹 novo campo
  }));
  

  // antes: await repo.upsertBatch(linhas);
  const upsert = await repo.upsertBatch(linhas);

  return { ok: true, upsert };
};
/** Atualização individual */
exports.atualizarUma = async ({ user, id, status, observacao }) => {
  const registro = await repo.buscarPorId(id);
  if (!registro) throw httpError("Registro não encontrado", 404);

  await ensurePermissao(user, registro.turma_id);

  if (!status && typeof observacao === "undefined") {
    // nada a atualizar
    return;
  }

  await repo.atualizarUma(id, { status, observacao });
};

/** Relatório por período (agregado por turma)
 * Admin: todas as turmas
 * Instrutor: somente turmas do próprio user.id
 * Retorno por turma: { turma_id, turma_nome, presentes, faltas, total, taxa_presenca }
 */
exports.relatorioPorPeriodo = async ({ user, inicio, fim }) => {
  if (!inicio || !fim) throw httpError("inicio e fim são obrigatórios", 400);

  let turmaIds = [];
  if (isInstrutor(user)) {
    const turmas = await repo.turmasDoInstrutor(user.id);
    turmaIds = turmas.map((t) => t.id);
    if (turmaIds.length === 0) return { inicio, fim, turmas: [] };
  }
  // Admin vê todas (turmaIds vazio => sem filtro)
  const rows = await repo.relatorioPorPeriodo({ inicio, fim, turmaIds });

  const turmas = rows.map((r) => {
    const total = Number(r.total) || 0;
    const presentes = Number(r.presentes) || 0;
    const faltas = Number(r.faltas) || 0;
    const taxa_presenca = total > 0 ? +(presentes / total).toFixed(2) : 0;
    return {
      turma_id: r.turma_id,
      turma_nome: r.turma_nome,
      presentes,
      faltas,
      total,
      taxa_presenca,
    };
  });

  return { inicio, fim, turmas };
};

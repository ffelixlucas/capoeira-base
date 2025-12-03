import * as repo from "./presencasRepository";

/* --------------------------------------------------------- */
/* Tipos                                                     */
/* --------------------------------------------------------- */
interface UserToken {
  id: number;
  role: string;
  organizacao_id: number;
}

interface ListarParams {
  user: UserToken;
  turma_id: number;
  data: string;
}

interface BatchItem {
  aluno_id: number;
  status: string;
}

interface BatchParams {
  user: UserToken;
  turma_id: number;
  data: string;
  itens: BatchItem[];
}

interface AtualizarParams {
  user: UserToken;
  id: number;
  status?: string;
  observacao?: string;
}

interface RelatorioParams {
  user: UserToken;
  inicio: string;
  fim: string;
}

/* --------------------------------------------------------- */
/* Helpers                                                   */
/* --------------------------------------------------------- */
function httpError(message: string, status: number) {
  const e = new Error(message) as any;
  e.status = status;
  return e;
}

function roleOf(user: UserToken) {
  return user?.role?.toString()?.toLowerCase() ?? "";
}

function isInstrutor(user: UserToken) {
  return roleOf(user) === "instrutor";
}

async function ensurePermissao(user: UserToken, turmaId: number) {
  if (isInstrutor(user)) {
    const ok = await repo.instrutorPossuiTurma(user.id, turmaId);
    if (!ok) throw httpError("Sem permissão para esta turma", 403);
  }
}

/* --------------------------------------------------------- */
/* Listar por turma + data                                   */
/* --------------------------------------------------------- */
export async function listarPorTurmaEData({
  user,
  turma_id,
  data,
}: ListarParams) {
  const organizacaoId = user.organizacao_id;
  if (!organizacaoId) throw httpError("organização não encontrada", 401);

  await ensurePermissao(user, turma_id);

  const presencas = await repo.listarPorTurmaEData(
    turma_id,
    data,
    organizacaoId
  );

  return { turma_id, data, presencas };
}

/* --------------------------------------------------------- */
/* Salvar batch (upsert)                                     */
/* --------------------------------------------------------- */
export async function salvarBatch({
  user,
  turma_id,
  data,
  itens,
}: BatchParams) {
  const organizacaoId = user.organizacao_id;
  if (!organizacaoId) throw httpError("organização não encontrada", 401);

  await ensurePermissao(user, turma_id);

  if (!Array.isArray(itens) || itens.length === 0) {
    throw httpError("itens[] é obrigatório", 400);
  }

  const alunoIds = itens.map((i) => Number(i.aluno_id)).filter(Boolean);

  const fora = await repo.alunosForaDaTurma(turma_id, alunoIds);

  if (fora.length > 0) {
    throw httpError(
      `Alunos fora da turma ${turma_id}: ${fora.join(", ")}`,
      400
    );
  }
  const linhas: repo.PresencaLinha[] = itens.map((i) => ({
    aluno_id: Number(i.aluno_id),
    turma_id,
    data,
    status: i.status === "presente" ? "presente" : "falta",
    created_by: user.id,
    organizacao_id: organizacaoId,
  }));
  

  const upsert = await repo.upsertBatch(linhas);

  return { ok: true, upsert };
}

/* --------------------------------------------------------- */
/* Atualizar registro individual                              */
/* --------------------------------------------------------- */
export async function atualizarUma({
  user,
  id,
  status,
  observacao,
}: AtualizarParams) {
  const registro = await repo.buscarPorId(id);
  if (!registro) throw httpError("Registro não encontrado", 404);

  await ensurePermissao(user, registro.turma_id);

  if (!status && typeof observacao === "undefined") {
    return;
  }

  await repo.atualizarUma(id, { status, observacao });
}

/* --------------------------------------------------------- */
/* Relatório por período                                      */
/* --------------------------------------------------------- */
export async function relatorioPorPeriodo({
  user,
  inicio,
  fim,
}: RelatorioParams) {
  if (!inicio || !fim) throw httpError("inicio e fim são obrigatórios", 400);

  const organizacaoId = user.organizacao_id;
  if (!organizacaoId) throw httpError("organização não encontrada", 401);

  let turmaIds: number[] = [];

  if (isInstrutor(user)) {
    const turmas = await repo.turmasDoInstrutor(user.id);
    turmaIds = turmas.map((t: any) => t.id);

    if (turmaIds.length === 0) {
      return { inicio, fim, turmas: [] };
    }
  }

  const rows = await repo.relatorioPorPeriodo({
    inicio,
    fim,
    turmaIds,
    organizacaoId,
  });

  const turmas = rows.map((r: any) => {
    const total = Number(r.total) || 0;
    const presentes = Number(r.presentes) || 0;
    const faltas = Number(r.faltas) || 0;

    return {
      turma_id: r.turma_id,
      turma_nome: r.turma_nome,
      presentes,
      faltas,
      total,
      taxa_presenca: total > 0 ? +(presentes / total).toFixed(2) : 0,
    };
  });

  return { inicio, fim, turmas };
}

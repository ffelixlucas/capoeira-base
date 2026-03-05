import * as repo from "./presencasRepository";
import { logger } from "../../utils/logger";

/* --------------------------------------------------------- */
/* Tipos                                                     */
/* --------------------------------------------------------- */
interface UserToken {
  id: number;
  role?: string;
  roles?: string[];
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

interface ResumoDiaParams {
  user: UserToken;
  data: string;
}

interface AtividadesRecentesParams {
  user: UserToken;
  limit?: number;
  turma_id?: number;
}

/* --------------------------------------------------------- */
/* Helpers                                                   */
/* --------------------------------------------------------- */
function httpError(message: string, status: number) {
  const e = new Error(message) as any;
  e.status = status;
  return e;
}

function userRoles(user: UserToken) {
  if (Array.isArray(user?.roles)) {
    return user.roles.map((r) => String(r).toLowerCase());
  }
  if (user?.role) {
    return [String(user.role).toLowerCase()];
  }
  return [];
}

function isInstrutor(user: UserToken) {
  return userRoles(user).includes("instrutor");
}

function isAdmin(user: UserToken) {
  return userRoles(user).includes("admin");
}

async function ensurePermissao(user: UserToken, turmaId: number) {
  if (isInstrutor(user) && !isAdmin(user)) {
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

/* --------------------------------------------------------- */
/* Resumo diário para controle de chamada                    */
/* --------------------------------------------------------- */
export async function resumoDia({ user, data }: ResumoDiaParams) {
  if (!data) throw httpError("data é obrigatória", 400);

  const organizacaoId = user.organizacao_id;
  if (!organizacaoId) throw httpError("organização não encontrada", 401);

  const rows = await repo.resumoPorData({
    data,
    organizacaoId,
  });

  let turmas = rows.map((row: any) => ({
    turma_id: Number(row.turma_id),
    turma_nome: row.turma_nome,
    equipe_id: row.equipe_id ? Number(row.equipe_id) : null,
    nome_instrutor: row.nome_instrutor || null,
    total_registros: Number(row.total_registros || 0),
    presentes: Number(row.presentes || 0),
    faltas: Number(row.faltas || 0),
    ultima_atualizacao: row.ultima_atualizacao || null,
    lancado_por_nome: row.lancado_por_nome || null,
    chamada_lancada: Number(row.total_registros || 0) > 0,
  }));

  if (isInstrutor(user) && !isAdmin(user)) {
    const minhas = await repo.turmasDoInstrutor(user.id);
    const idsPermitidos = new Set((minhas || []).map((t: any) => Number(t.id)));
    turmas = turmas.filter((t) => idsPermitidos.has(t.turma_id));
  }

  const totalTurmas = turmas.length;
  const turmasComChamada = turmas.filter((t) => t.chamada_lancada).length;
  const turmasSemChamada = totalTurmas - turmasComChamada;

  return {
    data,
    total_turmas: totalTurmas,
    turmas_com_chamada: turmasComChamada,
    turmas_sem_chamada: turmasSemChamada,
    turmas,
  };
}

/* --------------------------------------------------------- */
/* Últimas atividades de chamada                             */
/* --------------------------------------------------------- */
export async function atividadesRecentes({
  user,
  limit = 20,
  turma_id,
}: AtividadesRecentesParams) {
  const organizacaoId = user.organizacao_id;
  if (!organizacaoId) throw httpError("organização não encontrada", 401);

  if (isAdmin(user)) {
    logger.debug("[presencasService] atividadesRecentes:admin", {
      userId: user.id,
      organizacaoId,
      limit,
      turma_id,
    });

    if (Number.isFinite(turma_id) && Number(turma_id) > 0) {
      const rows = await repo.atividadesDaTurma({
        organizacaoId,
        turmaId: Number(turma_id),
        limit,
      });
      logger.debug("[presencasService] atividadesRecentes:admin_turma_rows", {
        turma_id,
        totalRows: rows.length,
        primeiraData: rows[0]?.data || null,
      });

      const historico = rows.map((r: any) => ({
        created_by: r.created_by ? Number(r.created_by) : null,
        nome_instrutor: r.nome_instrutor || "Instrutor",
        turma_id: Number(r.turma_id),
        turma_nome: r.turma_nome || `Turma #${r.turma_id}`,
        data: r.data,
        total_registros: Number(r.total_registros || 0),
        presentes: Number(r.presentes || 0),
        faltas: Number(r.faltas || 0),
        ultima_atualizacao: r.ultima_atualizacao || null,
      }));

      return {
        tipo: "admin_turma",
        atividade: historico[0] || null,
        historico,
      };
    }

    const rows = await repo.ultimasAtividadesPorInstrutor({
      organizacaoId,
      limit,
    });
    logger.debug("[presencasService] atividadesRecentes:admin_lista_rows", {
      totalRows: rows.length,
      primeiraData: rows[0]?.data || null,
    });

    const atividades = rows.map((r: any) => ({
      created_by: r.created_by ? Number(r.created_by) : null,
      nome_instrutor: r.nome_instrutor || "Instrutor",
      turma_id: Number(r.turma_id),
      turma_nome: r.turma_nome || `Turma #${r.turma_id}`,
      data: r.data,
      total_registros: Number(r.total_registros || 0),
      presentes: Number(r.presentes || 0),
      faltas: Number(r.faltas || 0),
      ultima_atualizacao: r.ultima_atualizacao || null,
    }));

    return { tipo: "admin", atividades };
  }

  const ultima = await repo.ultimaAtividadeDoUsuario({
    organizacaoId,
    userId: user.id,
  });

  const historicoRows = await repo.atividadesDoUsuario({
    organizacaoId,
    userId: user.id,
    limit,
  });
  logger.debug("[presencasService] atividadesRecentes:instrutor_base", {
    userId: user.id,
    limit,
    ultimaExiste: Boolean(ultima),
    historicoRows: historicoRows.length,
  });

  let historicoFonte = historicoRows;
  if (historicoFonte.length === 0) {
    const minhasTurmas = await repo.turmasDoInstrutor(user.id);
    const turmaIds = (minhasTurmas || []).map((t: any) => Number(t.id)).filter(Boolean);
    historicoFonte = await repo.atividadesPorTurmas({
      organizacaoId,
      turmaIds,
      limit,
    });
    logger.debug("[presencasService] atividadesRecentes:instrutor_fallback_turmas", {
      userId: user.id,
      turmaIds,
      historicoFallback: historicoFonte.length,
    });
  }

  const historico = historicoFonte.map((r: any) => ({
    created_by: r.created_by ? Number(r.created_by) : null,
    nome_instrutor: r.nome_instrutor || "Instrutor",
    turma_id: Number(r.turma_id),
    turma_nome: r.turma_nome || `Turma #${r.turma_id}`,
    data: r.data,
    total_registros: Number(r.total_registros || 0),
    presentes: Number(r.presentes || 0),
    faltas: Number(r.faltas || 0),
    ultima_atualizacao: r.ultima_atualizacao || null,
  }));

  if (!ultima && historico.length > 0) {
    return { tipo: "instrutor", atividade: historico[0], historico };
  }
  if (!ultima) return { tipo: "instrutor", atividade: null, historico };

  return {
    tipo: "instrutor",
    atividade: {
      created_by: ultima.created_by ? Number(ultima.created_by) : null,
      nome_instrutor: ultima.nome_instrutor || "Instrutor",
      turma_id: Number(ultima.turma_id),
      turma_nome: ultima.turma_nome || `Turma #${ultima.turma_id}`,
      data: ultima.data,
      total_registros: Number(ultima.total_registros || 0),
      presentes: Number(ultima.presentes || 0),
      faltas: Number(ultima.faltas || 0),
      ultima_atualizacao: ultima.ultima_atualizacao || null,
    },
    historico,
  };
}

import db from "../../database/connection";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/* --------------------------------------------------------- */
/* Helpers de Tipos                                           */
/* --------------------------------------------------------- */
export interface PresencaLinha {
  aluno_id: number;
  turma_id: number;
  data: string;
  status: "presente" | "falta";
  created_by: number | null;
  organizacao_id: number;
}

/* --------------------------------------------------------- */
/* RBAC: Confere se o instrutor possui a turma               */
/* --------------------------------------------------------- */
export async function instrutorPossuiTurma(
  equipeId: number,
  turmaId: number
): Promise<boolean> {
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT 1 FROM turmas WHERE id = ? AND equipe_id = ? LIMIT 1",
    [turmaId, equipeId]
  );

  return rows.length > 0;
}

/* --------------------------------------------------------- */
/* Lista turmas do instrutor                                 */
/* --------------------------------------------------------- */
export async function turmasDoInstrutor(equipeId: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT id, nome FROM turmas WHERE equipe_id = ? ORDER BY nome ASC",
    [equipeId]
  );
  return rows;
}

/* --------------------------------------------------------- */
/* Listar presenças por turma e data                         */
/* --------------------------------------------------------- */
export async function listarPorTurmaEData(
  turmaId: number,
  data: string,
  organizacaoId: number
) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `
    SELECT 
      p.*, 
      a.nome AS aluno_nome, 
      a.apelido
    FROM presencas p
    JOIN alunos a ON a.id = p.aluno_id
    WHERE 
      p.turma_id = ?
      AND p.data = ?
      AND p.organizacao_id = ?
    ORDER BY a.nome ASC
  `,
    [turmaId, data, organizacaoId]
  );

  return rows;
}

/* --------------------------------------------------------- */
/* Upsert em lote                                             */
/* --------------------------------------------------------- */
export async function upsertBatch(linhas: PresencaLinha[]) {
  if (!linhas || linhas.length === 0)
    return { affectedRows: 0, info: "" };

  const values: any[] = [];
  const placeholders = linhas
    .map(
      () =>
        "(?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)"
    )
    .join(",");

  for (const l of linhas) {
    values.push(
      l.aluno_id,
      l.turma_id,
      l.data,
      l.status,
      l.created_by ?? null,
      l.organizacao_id ?? null
    );
  }

  const sql = `
    INSERT INTO presencas 
      (aluno_id, turma_id, data, status, created_by, organizacao_id, created_at, updated_at)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      status = VALUES(status),
      created_by = VALUES(created_by),
      updated_at = CURRENT_TIMESTAMP
  `;

  const [result] = await db.execute<ResultSetHeader>(sql, values);

  return {
    affectedRows: result.affectedRows ?? 0,
    info: (result as any).info ?? "",
  };
}

/* --------------------------------------------------------- */
/* Buscar por ID                                              */
/* --------------------------------------------------------- */
export async function buscarPorId(id: number) {
  const [rows] = await db.execute<RowDataPacket[]>(
    "SELECT * FROM presencas WHERE id = ?",
    [id]
  );

  return rows[0];
}

/* --------------------------------------------------------- */
/* Atualizar registro individual                              */
/* --------------------------------------------------------- */
export async function atualizarUma(
  id: number,
  data: { status?: string; observacao?: string }
) {
  const fields: string[] = [];
  const vals: any[] = [];

  if (data.status) {
    fields.push("status = ?");
    vals.push(data.status);
  }

  if (typeof data.observacao !== "undefined") {
    fields.push("observacao = ?");
    vals.push(data.observacao);
  }

  if (fields.length === 0) return;

  vals.push(id);

  const sql = `
    UPDATE presencas 
    SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `;

  await db.execute(sql, vals);
}

/* --------------------------------------------------------- */
/* Verificar alunos fora da turma                             */
/* --------------------------------------------------------- */
export async function alunosForaDaTurma(
  turmaId: number,
  alunoIds: number[] = []
) {
  if (!alunoIds.length) return [];

  const alunoIdsNum = alunoIds.map((n) => Number(n)).filter(Boolean);
  const turmaIdNum = Number(turmaId);

  const placeholders = alunoIdsNum.map(() => "?").join(",");

  const sql = `
    SELECT m.aluno_id
    FROM matriculas m
    WHERE 
      m.aluno_id IN (${placeholders})
      AND m.turma_id = ?
      AND m.data_fim IS NULL
  `;

  const params = [...alunoIdsNum, turmaIdNum];

  const [rows] = await db.execute<RowDataPacket[]>(sql, params);

  const encontrados = new Set(
    rows.map((r) => Number(r.aluno_id))
  );

  return alunoIdsNum.filter((id) => !encontrados.has(id));
}

/* --------------------------------------------------------- */
/* Relatório por período                                      */
/* --------------------------------------------------------- */
export async function relatorioPorPeriodo({
  inicio,
  fim,
  turmaIds = [],
  organizacaoId,
}: {
  inicio: string;
  fim: string;
  turmaIds?: number[];
  organizacaoId: number;
}) {
  const filtros = ["DATE(p.data) BETWEEN ? AND ?"];
  const params: any[] = [inicio, fim];

  if (Array.isArray(turmaIds) && turmaIds.length > 0) {
    const inPh = turmaIds.map(() => "?").join(",");
    filtros.push(`p.turma_id IN (${inPh})`);
    params.push(...turmaIds);
  }

  filtros.push("p.organizacao_id = ?");
  params.push(organizacaoId);

  const sql = `
    SELECT 
      p.turma_id,
      t.nome AS turma_nome,
      SUM(CASE WHEN p.status = 'presente' THEN 1 ELSE 0 END) AS presentes,
      SUM(CASE WHEN p.status = 'falta' THEN 1 ELSE 0 END)     AS faltas,
      COUNT(*) AS total
    FROM presencas p
    JOIN turmas t ON t.id = p.turma_id
    WHERE ${filtros.join(" AND ")}
    GROUP BY p.turma_id, t.nome
    ORDER BY t.nome ASC
  `;

  const [rows] = await db.execute<RowDataPacket[]>(sql, params);
  return rows;
}

/* --------------------------------------------------------- */
/* Resumo diário por turma                                   */
/* --------------------------------------------------------- */
export async function resumoPorData({
  data,
  organizacaoId,
}: {
  data: string;
  organizacaoId: number;
}) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `
    SELECT
      t.id AS turma_id,
      t.nome AS turma_nome,
      t.equipe_id,
      e.nome AS nome_instrutor,
      COALESCE(r.total_registros, 0) AS total_registros,
      COALESCE(r.presentes, 0) AS presentes,
      COALESCE(r.faltas, 0) AS faltas,
      r.ultima_atualizacao,
      cb.nome AS lancado_por_nome
    FROM turmas t
    LEFT JOIN equipe e ON e.id = t.equipe_id
    LEFT JOIN (
      SELECT
        p.turma_id,
        COUNT(*) AS total_registros,
        SUM(CASE WHEN p.status = 'presente' THEN 1 ELSE 0 END) AS presentes,
        SUM(CASE WHEN p.status = 'falta' THEN 1 ELSE 0 END) AS faltas,
        MAX(p.updated_at) AS ultima_atualizacao,
        CAST(
          SUBSTRING_INDEX(
            GROUP_CONCAT(p.created_by ORDER BY p.updated_at DESC SEPARATOR ','),
            ',',
            1
          ) AS UNSIGNED
        ) AS ultimo_created_by
      FROM presencas p
      WHERE p.organizacao_id = ? AND p.data = ?
      GROUP BY p.turma_id
    ) r ON r.turma_id = t.id
    LEFT JOIN equipe cb ON cb.id = r.ultimo_created_by
    WHERE t.organizacao_id = ?
    ORDER BY t.nome ASC
    `,
    [organizacaoId, data, organizacaoId]
  );

  return rows;
}

/* --------------------------------------------------------- */
/* Última atividade por instrutor (admin)                    */
/* --------------------------------------------------------- */
export async function ultimasAtividadesPorInstrutor({
  organizacaoId,
  limit = 20,
}: {
  organizacaoId: number;
  limit?: number;
}) {
  const limite = Math.min(200, Math.max(1, Number(limit) || 20));
  const [rows] = await db.execute<RowDataPacket[]>(
    `
    WITH sessoes AS (
      SELECT
        p.created_by,
        p.turma_id,
        p.data,
        COUNT(*) AS total_registros,
        SUM(CASE WHEN p.status = 'presente' THEN 1 ELSE 0 END) AS presentes,
        SUM(CASE WHEN p.status = 'falta' THEN 1 ELSE 0 END) AS faltas,
        MAX(p.updated_at) AS ultima_atualizacao
      FROM presencas p
      WHERE p.organizacao_id = ?
      GROUP BY p.created_by, p.turma_id, p.data
    ),
    ranked AS (
      SELECT
        s.*,
        ROW_NUMBER() OVER (
          PARTITION BY s.created_by
          ORDER BY s.data DESC, s.ultima_atualizacao DESC
        ) AS rn
      FROM sessoes s
    )
    SELECT
      r.created_by,
      e.nome AS nome_instrutor,
      r.turma_id,
      t.nome AS turma_nome,
      r.data,
      r.total_registros,
      r.presentes,
      r.faltas,
      r.ultima_atualizacao
    FROM ranked r
    LEFT JOIN equipe e ON e.id = r.created_by
    LEFT JOIN turmas t ON t.id = r.turma_id
    WHERE r.rn = 1
    ORDER BY r.data DESC, r.ultima_atualizacao DESC
    LIMIT ${limite}
    `,
    [organizacaoId]
  );

  return rows;
}

/* --------------------------------------------------------- */
/* Última atividade do usuário                               */
/* --------------------------------------------------------- */
export async function ultimaAtividadeDoUsuario({
  organizacaoId,
  userId,
}: {
  organizacaoId: number;
  userId: number;
}) {
  const [rows] = await db.execute<RowDataPacket[]>(
    `
    SELECT
      p.created_by,
      e.nome AS nome_instrutor,
      p.turma_id,
      t.nome AS turma_nome,
      p.data,
      COUNT(*) AS total_registros,
      SUM(CASE WHEN p.status = 'presente' THEN 1 ELSE 0 END) AS presentes,
      SUM(CASE WHEN p.status = 'falta' THEN 1 ELSE 0 END) AS faltas,
      MAX(p.updated_at) AS ultima_atualizacao
    FROM presencas p
    LEFT JOIN equipe e ON e.id = p.created_by
    LEFT JOIN turmas t ON t.id = p.turma_id
    WHERE p.organizacao_id = ? AND p.created_by = ?
    GROUP BY p.created_by, e.nome, p.turma_id, t.nome, p.data
    ORDER BY p.data DESC, MAX(p.updated_at) DESC
    LIMIT 1
    `,
    [organizacaoId, userId]
  );

  return rows[0] || null;
}

/* --------------------------------------------------------- */
/* Histórico de atividades do usuário                        */
/* --------------------------------------------------------- */
export async function atividadesDoUsuario({
  organizacaoId,
  userId,
  limit = 90,
}: {
  organizacaoId: number;
  userId: number;
  limit?: number;
}) {
  const limite = Math.min(365, Math.max(1, Number(limit) || 90));
  const [rows] = await db.execute<RowDataPacket[]>(
    `
    SELECT
      p.created_by,
      e.nome AS nome_instrutor,
      p.turma_id,
      t.nome AS turma_nome,
      p.data,
      COUNT(*) AS total_registros,
      SUM(CASE WHEN p.status = 'presente' THEN 1 ELSE 0 END) AS presentes,
      SUM(CASE WHEN p.status = 'falta' THEN 1 ELSE 0 END) AS faltas,
      MAX(p.updated_at) AS ultima_atualizacao
    FROM presencas p
    LEFT JOIN equipe e ON e.id = p.created_by
    LEFT JOIN turmas t ON t.id = p.turma_id
    WHERE p.organizacao_id = ? AND p.created_by = ?
    GROUP BY p.created_by, e.nome, p.turma_id, t.nome, p.data
    ORDER BY p.data DESC, MAX(p.updated_at) DESC
    LIMIT ${limite}
    `,
    [organizacaoId, userId]
  );

  return rows;
}

/* --------------------------------------------------------- */
/* Histórico por turmas do instrutor (fallback)              */
/* --------------------------------------------------------- */
export async function atividadesPorTurmas({
  organizacaoId,
  turmaIds,
  limit = 90,
}: {
  organizacaoId: number;
  turmaIds: number[];
  limit?: number;
}) {
  if (!Array.isArray(turmaIds) || turmaIds.length === 0) return [];

  const limite = Math.min(365, Math.max(1, Number(limit) || 90));
  const inPh = turmaIds.map(() => "?").join(",");
  const [rows] = await db.execute<RowDataPacket[]>(
    `
    SELECT
      CAST(
        SUBSTRING_INDEX(
          GROUP_CONCAT(p.created_by ORDER BY p.updated_at DESC SEPARATOR ','),
          ',',
          1
        ) AS UNSIGNED
      ) AS created_by,
      p.turma_id,
      t.nome AS turma_nome,
      p.data,
      COUNT(*) AS total_registros,
      SUM(CASE WHEN p.status = 'presente' THEN 1 ELSE 0 END) AS presentes,
      SUM(CASE WHEN p.status = 'falta' THEN 1 ELSE 0 END) AS faltas,
      MAX(p.updated_at) AS ultima_atualizacao
    FROM presencas p
    LEFT JOIN turmas t ON t.id = p.turma_id
    WHERE p.organizacao_id = ?
      AND p.turma_id IN (${inPh})
    GROUP BY p.turma_id, t.nome, p.data
    ORDER BY p.data DESC, MAX(p.updated_at) DESC
    LIMIT ${limite}
    `,
    [organizacaoId, ...turmaIds]
  );

  return rows;
}

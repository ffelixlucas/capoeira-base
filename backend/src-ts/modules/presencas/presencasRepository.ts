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

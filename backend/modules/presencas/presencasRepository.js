const db = require("../../database/connection");

/** RBAC: Confere se o instrutor (equipe_id) é responsável pela turma */
exports.instrutorPossuiTurma = async (equipeId, turmaId) => {
  const [rows] = await db.execute(
    "SELECT 1 FROM turmas WHERE id = ? AND equipe_id = ? LIMIT 1",
    [turmaId, equipeId]
  );
  return rows.length > 0;
};

/** Lista as turmas de um instrutor (responsável pelo espaço ou pela turma) */
exports.turmasDoInstrutor = async (equipeId) => {
  const [rows] = await db.execute(
    "SELECT id, nome FROM turmas WHERE equipe_id = ? ORDER BY nome ASC",
    [equipeId]
  );
  return rows;
};

/** Lista presenças por turma e data (dia) */
exports.listarPorTurmaEData = async (turmaId, data) => {
  const [rows] = await db.execute(
    `SELECT p.*, a.nome AS aluno_nome, a.apelido
       FROM presencas p
       JOIN alunos a ON a.id = p.aluno_id
      WHERE p.turma_id = ? AND p.data = ?
      ORDER BY a.nome ASC`,
    [turmaId, data]
  );
  return rows;
};

/** Upsert em lote usando UNIQUE (aluno_id, turma_id, data) */
exports.upsertBatch = async (linhas = []) => {
  if (!linhas || linhas.length === 0) return;

  const values = [];
  const placeholders = linhas
    .map(() => "(?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")
    .join(",");

  for (const l of linhas) {
    values.push(
      l.aluno_id,
      l.turma_id,
      l.data,
      l.status,
      l.created_by ?? null
    );
  }

  const sql = `
    INSERT INTO presencas (aluno_id, turma_id, data, status, created_by, created_at, updated_at)
    VALUES ${placeholders}
    ON DUPLICATE KEY UPDATE
      status = VALUES(status),
      created_by = VALUES(created_by),
      updated_at = CURRENT_TIMESTAMP
  `;

  await db.execute(sql, values);
};

/** Buscar por id */
exports.buscarPorId = async (id) => {
  const [rows] = await db.execute("SELECT * FROM presencas WHERE id = ?", [id]);
  return rows[0];
};

/** Atualizar um registro */
exports.atualizarUma = async (id, { status, observacao }) => {
  const fields = [];
  const vals = [];

  if (status) {
    fields.push("status = ?");
    vals.push(status);
  }
  if (typeof observacao !== "undefined") {
    fields.push("observacao = ?");
    vals.push(observacao);
  }

  if (fields.length === 0) return;

  vals.push(id);
  const sql = `UPDATE presencas SET ${fields.join(
    ", "
  )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  await db.execute(sql, vals);
};

/** Retorna quais IDs NÃO pertencem à turma informada */
exports.alunosForaDaTurma = async (turmaId, alunoIds = []) => {
  if (!alunoIds.length) return [];

  const placeholders = alunoIds.map(() => "?").join(",");
  const sql = `
    SELECT id 
      FROM alunos 
     WHERE id IN (${placeholders}) 
       AND turma_id = ?
  `;
  const params = [...alunoIds, turmaId];

  const [rows] = await db.execute(sql, params);
  const encontrados = new Set(rows.map((r) => r.id));
  return alunoIds.filter((id) => !encontrados.has(id));
};

/** Relatório por período (agregado por turma) 
 * Retorna: turma_id, turma_nome, presentes, faltas, total
 * - inicio/fim no formato 'YYYY-MM-DD'
 * - turmaIds opcional: limita o relatório a um conjunto de turmas
 */
exports.relatorioPorPeriodo = async ({ inicio, fim, turmaIds = [] }) => {
  const filtros = ["DATE(p.data) BETWEEN ? AND ?"];
  const params = [inicio, fim];

  if (Array.isArray(turmaIds) && turmaIds.length > 0) {
    const inPh = turmaIds.map(() => "?").join(",");
    filtros.push(`p.turma_id IN (${inPh})`);
    params.push(...turmaIds);
  }

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

  const [rows] = await db.execute(sql, params);
  return rows;
};

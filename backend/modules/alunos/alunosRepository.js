// alunosRepository.js
const connection = require("../../database/connection");
const logger = require("../../utils/logger");

/* -------------------------------------------------------------------------- */
/* 🔹 Lista todos os alunos ativos com a turma atual                          */
/* -------------------------------------------------------------------------- */
async function listarAlunosComTurmaAtual(organizacaoId) {
  const [rows] = await connection.execute(
    `
    SELECT 
      a.id, a.nome, a.apelido,
      t.nome AS turma, t.id AS turma_id
    FROM alunos a
    LEFT JOIN matriculas m 
      ON m.aluno_id = a.id AND m.data_fim IS NULL
    LEFT JOIN turmas t 
      ON t.id = m.turma_id
    WHERE a.status = 'ativo' AND a.organizacao_id = ?
    ORDER BY a.nome
    `,
    [organizacaoId]
  );
  return rows;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Lista alunos de turmas específicas (por array de IDs)                   */
/* -------------------------------------------------------------------------- */
async function listarAlunosPorTurmas(turmaIds, organizacaoId) {
  if (!turmaIds || turmaIds.length === 0) return [];
  const placeholders = turmaIds.map(() => "?").join(",");

  const [rows] = await connection.execute(
    `
    SELECT 
      a.id, a.nome, a.apelido,
      t.nome AS turma, t.id AS turma_id
    FROM alunos a
    JOIN matriculas m ON m.aluno_id = a.id AND m.data_fim IS NULL
    JOIN turmas t ON t.id = m.turma_id
    WHERE t.id IN (${placeholders})
      AND a.organizacao_id = ?
    ORDER BY a.nome
    `,
    [...turmaIds, organizacaoId]
  );

  return rows;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Busca aluno por ID (valida organização)                                 */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id, organizacaoId) {
  const [rows] = await connection.execute(
    `
    SELECT 
      a.*,
      t.nome AS turma,
      t.id AS turma_id,
      c.nome AS categoria_nome,
      g.nome AS graduacao_nome
    FROM alunos a
    LEFT JOIN matriculas m 
      ON m.aluno_id = a.id AND m.data_fim IS NULL
    LEFT JOIN turmas t 
      ON t.id = m.turma_id
    LEFT JOIN categorias c 
      ON a.categoria_id = c.id
    LEFT JOIN graduacoes g 
      ON a.graduacao_id = g.id
    WHERE a.id = ? AND a.organizacao_id = ?
    `,
    [id, organizacaoId]
  );

  return rows[0];
}


/* -------------------------------------------------------------------------- */
/* 🔹 Cria novo aluno e matrícula inicial                                     */
/* -------------------------------------------------------------------------- */
async function criarAluno(dados) {
  const {
    organizacao_id,
    nome,
    apelido,
    nascimento,
    telefone_responsavel,
    nome_responsavel,
    endereco,
    graduacao,
    observacoes_medicas,
    turma_id,
  } = dados;

  const sql = `
    INSERT INTO alunos (
      organizacao_id, nome, apelido, nascimento,
      telefone_responsavel, nome_responsavel,
      endereco, graduacao, observacoes_medicas,
      status, criado_em, atualizado_em, turma_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', NOW(), NOW(), ?)
  `;

  const params = [
    organizacao_id,
    nome,
    apelido,
    nascimento,
    telefone_responsavel,
    nome_responsavel,
    endereco,
    graduacao,
    observacoes_medicas,
    turma_id,
  ];

  const [result] = await connection.execute(sql, params);
  const alunoId = result.insertId;

  // Cria matrícula vinculada à mesma organização
  await connection.execute(
    `INSERT INTO matriculas (aluno_id, turma_id, organizacao_id, data_inicio) 
     VALUES (?, ?, ?, CURDATE())`,
    [alunoId, turma_id, organizacao_id]
  );

  logger.info(`[alunosRepository] Novo aluno criado (org ${organizacao_id})`);
  return alunoId;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Edita aluno (valida organização)                                        */
/* -------------------------------------------------------------------------- */
async function editarAluno(id, dados, organizacaoId) {
  const campos = [
    "nome",
    "apelido",
    "nascimento",
    "telefone_responsavel",
    "nome_responsavel",
    "endereco",
    "graduacao",
    "observacoes_medicas",
    "foto_url",
  ];

  const sets = campos.map((c) => `${c} = ?`).join(", ");
  const valores = campos.map((c) => dados[c] ?? null);
  valores.push(id, organizacaoId);

  await connection.execute(
    `UPDATE alunos SET ${sets} WHERE id = ? AND organizacao_id = ?`,
    valores
  );

  // Se turma foi alterada, atualiza matrícula
  if (dados.turma_id) {
    const matriculaAtual = await buscarMatriculaAtual(id, organizacaoId);
    const turmaAtualId = matriculaAtual?.turma_id;
    if (!turmaAtualId || turmaAtualId !== parseInt(dados.turma_id)) {
      await trocarTurma(id, dados.turma_id, organizacaoId);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Exclui aluno da própria organização                                     */
/* -------------------------------------------------------------------------- */
async function excluirAluno(id, organizacaoId) {
  await connection.execute(
    `DELETE FROM alunos WHERE id = ? AND organizacao_id = ?`,
    [id, organizacaoId]
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 Busca matrícula atual (valida organização)                              */
/* -------------------------------------------------------------------------- */
async function buscarMatriculaAtual(aluno_id, organizacaoId) {
  const [rows] = await connection.execute(
    `
    SELECT * FROM matriculas 
    WHERE aluno_id = ? AND data_fim IS NULL AND organizacao_id = ?
    `,
    [aluno_id, organizacaoId]
  );
  return rows[0];
}

/* -------------------------------------------------------------------------- */
/* 🔹 Troca turma do aluno (encerra e cria nova matrícula)                    */
/* -------------------------------------------------------------------------- */
async function trocarTurma(aluno_id, nova_turma_id, organizacaoId) {
  await connection.execute(
    `
    UPDATE matriculas 
    SET data_fim = CURDATE() 
    WHERE aluno_id = ? AND data_fim IS NULL AND organizacao_id = ?
    `,
    [aluno_id, organizacaoId]
  );

  await connection.execute(
    `
    INSERT INTO matriculas (aluno_id, turma_id, organizacao_id, data_inicio)
    VALUES (?, ?, ?, CURDATE())
    `,
    [aluno_id, nova_turma_id, organizacaoId]
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 Métricas de presença (multi-org)                                        */
/* -------------------------------------------------------------------------- */
async function metricasAluno(alunoId, inicio, fim, organizacaoId) {
  const [rows] = await connection.execute(
    `
    SELECT
      SUM(CASE WHEN status = 'presente' THEN 1 ELSE 0 END) AS presentes,
      SUM(CASE WHEN status = 'falta' THEN 1 ELSE 0 END) AS faltas,
      COUNT(*) AS total
    FROM presencas
    WHERE aluno_id = ?
      AND organizacao_id = ?
      AND DATE(data) BETWEEN ? AND ?
    `,
    [alunoId, organizacaoId, inicio, fim]
  );

  return {
    presentes: Number(rows[0]?.presentes || 0),
    faltas: Number(rows[0]?.faltas || 0),
    total: Number(rows[0]?.total || 0),
  };
}

/* -------------------------------------------------------------------------- */
/* 🔹 Pendentes / Status                                                      */
/* -------------------------------------------------------------------------- */
async function contarPendentes(organizacaoId) {
  const [rows] = await connection.execute(
    `SELECT COUNT(*) AS total FROM alunos WHERE status = 'pendente' AND organizacao_id = ?`,
    [organizacaoId]
  );
  return Number(rows[0]?.total || 0);
}

async function listarPendentes(organizacaoId) {
  const [rows] = await connection.execute(
    `
    SELECT id, nome, apelido, telefone_aluno, telefone_responsavel, email, status
    FROM alunos
    WHERE status = 'pendente' AND organizacao_id = ?
    ORDER BY criado_em ASC
    `,
    [organizacaoId]
  );
  return rows;
}

async function atualizarStatus(id, status, organizacaoId) {
  await connection.execute(
    `
    UPDATE alunos 
    SET status = ?, atualizado_em = NOW()
    WHERE id = ? AND organizacao_id = ?
    `,
    [status, id, organizacaoId]
  );
}

module.exports = {
  listarAlunosComTurmaAtual,
  listarAlunosPorTurmas,
  buscarPorId,
  criarAluno,
  editarAluno,
  excluirAluno,
  buscarMatriculaAtual,
  trocarTurma,
  metricasAluno,
  contarPendentes,
  listarPendentes,
  atualizarStatus,
};

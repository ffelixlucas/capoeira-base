const connection = require("../../database/connection");
const logger = require("../../utils/logger.js");

/* -------------------------------------------------------------------------- */
/* 🔹 Lista todos os alunos ativos com a turma atual                          */
/* -------------------------------------------------------------------------- */
async function listarAlunosComTurmaAtual(organizacaoId) {
  const [rows] = await connection.execute(
    `
    SELECT 
      a.id, 
      a.nome, 
      a.apelido, 
      a.foto_url,
      a.observacoes_medicas,

      -- 🔥 Categoria e Graduação
      c.nome AS categoria_nome,
      g.nome AS graduacao_nome,

      t.nome AS turma, 
      t.id AS turma_id,
      e.nome AS responsavel_turma

    FROM alunos a

    LEFT JOIN categorias c 
      ON c.id = a.categoria_id 
      AND c.organizacao_id = a.organizacao_id

    LEFT JOIN graduacoes g
      ON g.id = a.graduacao_id
      AND g.organizacao_id = a.organizacao_id

    LEFT JOIN matriculas m 
      ON m.aluno_id = a.id 
      AND m.data_fim IS NULL
      AND m.organizacao_id = a.organizacao_id

    LEFT JOIN turmas t 
      ON t.id = m.turma_id

    LEFT JOIN equipe e              
      ON e.id = t.equipe_id

    WHERE a.status = 'ativo'
      AND a.organizacao_id = ?

    ORDER BY a.nome
    `,
    [organizacaoId]
  );

  return rows;
}


/* -------------------------------------------------------------------------- */
/* 🔹 Lista alunos de turmas específicas                                      */
/* -------------------------------------------------------------------------- 
async function listarAlunosPorTurmas(turmaIds, organizacaoId) {
  if (!turmaIds || turmaIds.length === 0) return [];
  const placeholders = turmaIds.map(() => "?").join(",");

  const [rows] = await connection.execute(
    `
    SELECT 
      a.id, 
      a.nome, 
      a.apelido, 
      a.foto_url,
      t.nome AS turma,
      t.id AS turma_id,
      e.nome AS responsavel_turma
    FROM alunos a
    JOIN matriculas m 
      ON m.aluno_id = a.id AND m.data_fim IS NULL
    JOIN turmas t 
      ON t.id = m.turma_id
    LEFT JOIN equipe e 
      ON e.id = t.equipe_id
    WHERE t.id IN (${placeholders})
      AND a.organizacao_id = ? 
    ORDER BY a.nome
    `,
    [...turmaIds, organizacaoId]
  );

  return rows;
}

-------------------------------------------------------------------------- */
/* 🔹 Buscar aluno por ID                                                     */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id, organizacaoId) {
  const [rows] = await connection.execute(
    `
    SELECT
      a.*,
      c.nome AS categoria_nome,
      g.nome AS graduacao_nome,
      g.id AS graduacao_id,

      -- Turma atual via matricula
      t.id AS turma_id,
      t.nome AS turma_nome

    FROM alunos a
    LEFT JOIN categorias c ON c.id = a.categoria_id
    LEFT JOIN graduacoes g ON g.id = a.graduacao_id

    -- 🔥 Turma correta via matriculas
    LEFT JOIN matriculas m 
      ON m.aluno_id = a.id 
      AND m.organizacao_id = a.organizacao_id
      AND m.data_fim IS NULL

    LEFT JOIN turmas t 
      ON t.id = m.turma_id

    WHERE a.id = ?
      AND a.organizacao_id = ?
    `,
    [id, organizacaoId]
  );

  logger.debug("[buscarPorId] Resultado:", rows[0]);
  return rows[0];
}


/* -------------------------------------------------------------------------- */
/* 🔹 Busca matrícula atual (multi-org)                                       */
/* -------------------------------------------------------------------------- */
async function buscarMatriculaAtual(alunoId, organizacaoId) {
  const [rows] = await connection.execute(
    `
    SELECT *
    FROM matriculas
    WHERE aluno_id = ?
      AND organizacao_id = ?
      AND data_fim IS NULL
    LIMIT 1
    `,
    [alunoId, organizacaoId]
  );

  return rows[0] || null;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Troca turma (encerra matrícula antiga + cria nova)                      */
/* -------------------------------------------------------------------------- */
async function trocarTurma(alunoId, novaTurmaId, organizacaoId) {
  logger.info("[trocarTurma] Alterando turma...", {
    alunoId,
    novaTurmaId,
    organizacaoId,
  });

  // encerra matrícula anterior
  await connection.execute(
    `
    UPDATE matriculas
    SET data_fim = CURDATE()
    WHERE aluno_id = ?
      AND organizacao_id = ?
      AND data_fim IS NULL
    `,
    [alunoId, organizacaoId]
  );

  // abre nova matrícula
  await connection.execute(
    `
    INSERT INTO matriculas (aluno_id, turma_id, organizacao_id, data_inicio)
    VALUES (?, ?, ?, CURDATE())
    `,
    [alunoId, novaTurmaId, organizacaoId]
  );
}

/* -------------------------------------------------------------------------- */
/* 🔥 EDITAR ALUNO COMPLETO (dados pessoais + categoria + graduação + turma)  */
/* -------------------------------------------------------------------------- */
async function editarAluno(id, dados, organizacaoId) {
  logger.info("[editarAluno] Atualizando aluno...", {
    id,
    dados,
    organizacaoId,
  });

  const {
    nome,
    apelido,
    nascimento,
    telefone_aluno,
    telefone_responsavel,
    nome_responsavel,
    responsavel_documento,
    responsavel_parentesco,
    endereco,
    observacoes_medicas,
    autorizacao_imagem,
    aceite_lgpd,
    foto_url,
    categoria_id,
    graduacao_id,
    turma_id,
  } = dados;

  /* ---------------------------------------------------------------------- */
  /* 🔹 Atualiza todos os campos do aluno                                   */
  /* ---------------------------------------------------------------------- */
  await connection.execute(
    `
    UPDATE alunos SET
      nome = ?,
      apelido = ?,
      nascimento = ?,
      telefone_aluno = ?,
      telefone_responsavel = ?,
      nome_responsavel = ?,
      responsavel_documento = ?,
      responsavel_parentesco = ?,
      endereco = ?,
      observacoes_medicas = ?,
      autorizacao_imagem = ?,
      aceite_lgpd = ?,
      foto_url = ?,
      categoria_id = ?,
      graduacao_id = ?
    WHERE id = ?
      AND organizacao_id = ?
    `,
    [
      nome || null,
      apelido || null,
      nascimento || null,
      telefone_aluno || null,
      telefone_responsavel || null,
      nome_responsavel || null,
      responsavel_documento || null,
      responsavel_parentesco || null,
      endereco || null,
      observacoes_medicas || null,

      // 🔥 segurança: só altera se campo veio no payload
      autorizacao_imagem != null ? Number(autorizacao_imagem) : 0,
      aceite_lgpd != null ? Number(aceite_lgpd) : 0,

      foto_url || null,
      categoria_id || null,
      graduacao_id || null,

      id,
      organizacaoId,
    ]
  );

  /* ---------------------------------------------------------------------- */
  /* 🔹 Atualizar matrícula se turma mudou                                   */
  /* ---------------------------------------------------------------------- */
  if (turma_id) {
    const atual = await buscarMatriculaAtual(id, organizacaoId);

    const turmaAtual = atual?.turma_id;

    if (!turmaAtual || Number(turmaAtual) !== Number(turma_id)) {
      await trocarTurma(id, turma_id, organizacaoId);
      logger.info("[editarAluno] Turma atualizada via matrícula");
    }
  }

  return { sucesso: true };
}

/* -------------------------------------------------------------------------- */
/* 🔹 Excluir aluno                                                           */
/* -------------------------------------------------------------------------- */
async function excluirAluno(id, organizacaoId) {
  logger.warn("[excluirAluno] Removendo aluno", { id, organizacaoId });

  await connection.execute(
    `DELETE FROM alunos WHERE id = ? AND organizacao_id = ?`,
    [id, organizacaoId]
  );

  return { sucesso: true };
}

/* -------------------------------------------------------------------------- */
/* 🔹 Métricas de presença                                                    */
/* -------------------------------------------------------------------------- */
async function metricasAluno(id, inicio, fim, organizacaoId) {
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
    [id, organizacaoId, inicio, fim]
  );

  return {
    presentes: Number(rows[0]?.presentes || 0),
    faltas: Number(rows[0]?.faltas || 0),
    total: Number(rows[0]?.total || 0),
  };
}

/* -------------------------------------------------------------------------- */
/* 🔹 Pendentes                                                               */
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
    SELECT 
      id, nome, apelido, telefone_aluno, telefone_responsavel, email, status
    FROM alunos
    WHERE status = 'pendente'
      AND organizacao_id = ?
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
  //listarAlunosPorTurmas,
  buscarPorId,
  editarAluno,
  excluirAluno,
  buscarMatriculaAtual,
  trocarTurma,
  metricasAluno,
  contarPendentes,
  listarPendentes,
  atualizarStatus,
};

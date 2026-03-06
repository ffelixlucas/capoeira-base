const connection = require("../../database/connection");
const logger = require("../../utils/logger.js");

let transferenciasTableReady = false;

async function ensureTransferenciasTable() {
  if (transferenciasTableReady) return;

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS transferencias_turma (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organizacao_id INT NOT NULL,
      aluno_id INT NOT NULL,
      turma_origem_id INT NOT NULL,
      turma_destino_id INT NOT NULL,
      solicitado_por INT NOT NULL,
      confirmado_por INT NULL,
      status ENUM('pendente','confirmada','cancelada') NOT NULL DEFAULT 'pendente',
      observacao VARCHAR(255) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      confirmed_at DATETIME NULL,
      INDEX idx_transferencia_org_status (organizacao_id, status),
      INDEX idx_transferencia_destino (organizacao_id, turma_destino_id, status),
      INDEX idx_transferencia_aluno (organizacao_id, aluno_id, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  transferenciasTableReady = true;
}

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
/* -------------------------------------------------------------------------- */
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
      a.observacoes_medicas,
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

/*-------------------------------------------------------------------------- */
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
    organizacaoId,
  });

  const campos = [];
  const valores = [];

  function add(campo, valor) {
    campos.push(`${campo} = ?`);
    valores.push(valor);
  }

  add("nome", dados.nome || null);
  add("apelido", dados.apelido || null);
  add("nascimento", dados.nascimento || null);
  add("telefone_aluno", dados.telefone_aluno || null);
  add("telefone_responsavel", dados.telefone_responsavel || null);
  add("nome_responsavel", dados.nome_responsavel || null);
  add("responsavel_documento", dados.responsavel_documento || null);
  add("responsavel_parentesco", dados.responsavel_parentesco || null);
  add("endereco", dados.endereco || null);
  add("observacoes_medicas", dados.observacoes_medicas || null);

  if (dados.autorizacao_imagem !== undefined) {
    add("autorizacao_imagem", Number(dados.autorizacao_imagem));
  }

  if (dados.aceite_lgpd !== undefined) {
    add("aceite_lgpd", Number(dados.aceite_lgpd));
  }

  // 🔥 AQUI ESTÁ O FIX
  if (dados.foto_url !== undefined) {
    add("foto_url", dados.foto_url);
  }

  add("categoria_id", dados.categoria_id || null);
  add("graduacao_id", dados.graduacao_id || null);

  const sql = `
    UPDATE alunos
    SET ${campos.join(", ")}
    WHERE id = ?
      AND organizacao_id = ?
  `;

  valores.push(id, organizacaoId);

  logger.debug("[editarAluno] SQL:", sql);
  logger.debug("[editarAluno] Params:", valores);

  await connection.execute(sql, valores);

  // turma continua igual
  if (dados.turma_id) {
    const atual = await buscarMatriculaAtual(id, organizacaoId);
    if (!atual || Number(atual.turma_id) !== Number(dados.turma_id)) {
      await trocarTurma(id, dados.turma_id, organizacaoId);
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

async function metricasAlunosLote(alunoIds, inicio, fim, organizacaoId) {
  if (!alunoIds || alunoIds.length === 0) return {};

  const placeholders = alunoIds.map(() => "?").join(",");

  const [rows] = await connection.execute(
    `
    SELECT
      aluno_id,
      SUM(CASE WHEN status = 'presente' THEN 1 ELSE 0 END) AS presentes,
      SUM(CASE WHEN status = 'falta' THEN 1 ELSE 0 END) AS faltas,
      COUNT(*) AS total
    FROM presencas
    WHERE aluno_id IN (${placeholders})
      AND organizacao_id = ?
      AND DATE(data) BETWEEN ? AND ?
    GROUP BY aluno_id
    `,
    [...alunoIds, organizacaoId, inicio, fim]
  );

  const resultado = {};

  for (const row of rows) {
    const total = Number(row.total || 0);
    const presentes = Number(row.presentes || 0);

    resultado[row.aluno_id] = {
      presentes,
      faltas: Number(row.faltas || 0),
      total,
      taxa_presenca: total > 0 ? +(presentes / total).toFixed(2) : 0,
    };
  }

  return resultado;
}

async function criarSolicitacaoTransferencia(
  alunoId,
  turmaOrigemId,
  turmaDestinoId,
  organizacaoId,
  solicitadoPor,
  observacao = null
) {
  await ensureTransferenciasTable();

  const [pendentes] = await connection.execute(
    `
    SELECT id
    FROM transferencias_turma
    WHERE organizacao_id = ?
      AND aluno_id = ?
      AND status = 'pendente'
    ORDER BY id DESC
    LIMIT 1
    `,
    [organizacaoId, alunoId]
  );

  if (pendentes.length > 0) {
    throw new Error("Já existe uma transferência pendente para este aluno.");
  }

  const [result] = await connection.execute(
    `
    INSERT INTO transferencias_turma (
      organizacao_id, aluno_id, turma_origem_id, turma_destino_id, solicitado_por, observacao
    ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [organizacaoId, alunoId, turmaOrigemId, turmaDestinoId, solicitadoPor, observacao]
  );

  return result.insertId;
}

async function listarTransferenciasRecentes(organizacaoId, limit = 10) {
  await ensureTransferenciasTable();
  const limitSeguro = Math.max(1, Math.min(Number(limit) || 10, 50));

  const [rows] = await connection.execute(
    `
    SELECT
      tt.id,
      tt.aluno_id,
      tt.turma_origem_id,
      tt.turma_destino_id,
      tt.solicitado_por,
      tt.confirmado_por,
      tt.status,
      tt.observacao,
      tt.created_at,
      tt.confirmed_at,
      a.nome AS aluno_nome,
      tor.nome AS turma_origem_nome,
      tde.nome AS turma_destino_nome,
      es.nome AS solicitado_por_nome,
      ec.nome AS confirmado_por_nome
    FROM transferencias_turma tt
    LEFT JOIN alunos a ON a.id = tt.aluno_id
    LEFT JOIN turmas tor ON tor.id = tt.turma_origem_id
    LEFT JOIN turmas tde ON tde.id = tt.turma_destino_id
    LEFT JOIN equipe es ON es.id = tt.solicitado_por
    LEFT JOIN equipe ec ON ec.id = tt.confirmado_por
    WHERE tt.organizacao_id = ?
    ORDER BY tt.created_at DESC, tt.id DESC
    LIMIT ${limitSeguro}
    `,
    [organizacaoId]
  );

  return rows;
}

async function listarTransferenciasPendentes(organizacaoId, turmaDestinoId = null) {
  await ensureTransferenciasTable();

  const params = [organizacaoId];
  let filtroTurma = "";
  if (turmaDestinoId) {
    filtroTurma = " AND tt.turma_destino_id = ?";
    params.push(turmaDestinoId);
  }

  const [rows] = await connection.execute(
    `
    SELECT
      tt.id,
      tt.aluno_id,
      tt.turma_origem_id,
      tt.turma_destino_id,
      tt.solicitado_por,
      tt.status,
      tt.observacao,
      tt.created_at,
      a.nome AS aluno_nome,
      a.apelido AS aluno_apelido,
      tor.nome AS turma_origem_nome,
      tde.nome AS turma_destino_nome,
      tde.equipe_id AS turma_destino_equipe_id,
      es.nome AS solicitado_por_nome
    FROM transferencias_turma tt
    LEFT JOIN alunos a ON a.id = tt.aluno_id
    LEFT JOIN turmas tor ON tor.id = tt.turma_origem_id
    LEFT JOIN turmas tde ON tde.id = tt.turma_destino_id
    LEFT JOIN equipe es ON es.id = tt.solicitado_por
    WHERE tt.organizacao_id = ?
      AND tt.status = 'pendente'
      ${filtroTurma}
    ORDER BY tt.created_at DESC, tt.id DESC
    `,
    params
  );

  return rows;
}

async function buscarTransferenciaPorId(id, organizacaoId) {
  await ensureTransferenciasTable();

  const [rows] = await connection.execute(
    `
    SELECT
      tt.*,
      tde.equipe_id AS turma_destino_equipe_id
    FROM transferencias_turma tt
    LEFT JOIN turmas tde ON tde.id = tt.turma_destino_id
    WHERE tt.id = ?
      AND tt.organizacao_id = ?
    LIMIT 1
    `,
    [id, organizacaoId]
  );

  return rows[0] || null;
}

async function confirmarTransferencia(id, organizacaoId, confirmadoPor) {
  await ensureTransferenciasTable();

  await connection.execute(
    `
    UPDATE transferencias_turma
    SET status = 'confirmada',
        confirmado_por = ?,
        confirmed_at = NOW()
    WHERE id = ?
      AND organizacao_id = ?
      AND status = 'pendente'
    `,
    [confirmadoPor, id, organizacaoId]
  );
}

async function cancelarTransferencia(
  id,
  organizacaoId,
  usuarioId,
  statusAtual = "confirmada"
) {
  await ensureTransferenciasTable();

  await connection.execute(
    `
    UPDATE transferencias_turma
    SET status = 'cancelada',
        confirmado_por = ?,
        confirmed_at = NOW()
    WHERE id = ?
      AND organizacao_id = ?
      AND status = ?
    `,
    [usuarioId, id, organizacaoId, statusAtual]
  );
}

module.exports = {
  listarAlunosComTurmaAtual,
  listarAlunosPorTurmas,
  buscarPorId,
  editarAluno,
  excluirAluno,
  buscarMatriculaAtual,
  trocarTurma,
  metricasAluno,
  contarPendentes,
  listarPendentes,
  atualizarStatus,
  metricasAlunosLote,
  criarSolicitacaoTransferencia,
  listarTransferenciasRecentes,
  listarTransferenciasPendentes,
  buscarTransferenciaPorId,
  confirmarTransferencia,
  cancelarTransferencia
};

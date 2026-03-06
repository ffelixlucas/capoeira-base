const db = require("../database/connection");
const logger = require("./logger.js");

let tabelaPronta = false;
const orgsSemeadas = new Set();

async function garantirTabelaAuditoria() {
  if (tabelaPronta) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS auditoria_atividades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organizacao_id INT NOT NULL,
      usuario_id INT NULL,
      usuario_nome VARCHAR(180) NULL,
      acao VARCHAR(80) NOT NULL,
      entidade VARCHAR(80) NOT NULL,
      entidade_id VARCHAR(80) NULL,
      descricao VARCHAR(255) NOT NULL,
      metadata_json TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_auditoria_org_data (organizacao_id, created_at),
      INDEX idx_auditoria_org_acao (organizacao_id, acao)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  tabelaPronta = true;
}

async function registrarAuditoria({
  organizacaoId,
  usuarioId = null,
  usuarioNome = null,
  acao,
  entidade,
  entidadeId = null,
  descricao,
  metadata = null,
}) {
  try {
    if (!organizacaoId || !acao || !entidade || !descricao) return;
    await garantirTabelaAuditoria();
    await db.execute(
      `
      INSERT INTO auditoria_atividades (
        organizacao_id, usuario_id, usuario_nome, acao, entidade, entidade_id, descricao, metadata_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        organizacaoId,
        usuarioId,
        usuarioNome,
        acao,
        entidade,
        entidadeId ? String(entidadeId) : null,
        descricao,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
  } catch (error) {
    logger.warn("[auditoria] Falha ao registrar atividade", {
      erro: error.message,
      acao,
      entidade,
      organizacaoId,
    });
  }
}

async function tabelaPossuiColuna(tabela, coluna) {
  const [rows] = await db.execute(
    `
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = ?
      AND column_name = ?
    LIMIT 1
    `,
    [tabela, coluna]
  );
  return rows.length > 0;
}

async function semearTransferenciasLegadas(organizacaoId) {
  await db.execute(
    `
    INSERT INTO auditoria_atividades (
      organizacao_id, usuario_id, usuario_nome, acao, entidade, entidade_id, descricao, metadata_json, created_at
    )
    SELECT
      tt.organizacao_id,
      COALESCE(tt.confirmado_por, tt.solicitado_por) AS usuario_id,
      COALESCE(ec.nome, es.nome) AS usuario_nome,
      CASE
        WHEN tt.status = 'confirmada' THEN 'transferencia_confirmada'
        WHEN tt.status = 'cancelada' THEN 'transferencia_cancelada'
        ELSE 'transferencia_solicitada'
      END AS acao,
      'transferencia_turma' AS entidade,
      CAST(tt.id AS CHAR) AS entidade_id,
      CONCAT(
        'Transferência de ',
        COALESCE(a.nome, CONCAT('#', tt.aluno_id)),
        ': ',
        COALESCE(tor.nome, CONCAT('#', tt.turma_origem_id)),
        ' -> ',
        COALESCE(tde.nome, CONCAT('#', tt.turma_destino_id))
      ) AS descricao,
      JSON_OBJECT('transferencia_id', tt.id, 'status', tt.status, 'origem', 'legado'),
      COALESCE(tt.confirmed_at, tt.created_at) AS created_at
    FROM transferencias_turma tt
    LEFT JOIN alunos a ON a.id = tt.aluno_id
    LEFT JOIN turmas tor ON tor.id = tt.turma_origem_id
    LEFT JOIN turmas tde ON tde.id = tt.turma_destino_id
    LEFT JOIN equipe es ON es.id = tt.solicitado_por
    LEFT JOIN equipe ec ON ec.id = tt.confirmado_por
    WHERE tt.organizacao_id = ?
      AND NOT EXISTS (
        SELECT 1
        FROM auditoria_atividades aa
        WHERE aa.organizacao_id = tt.organizacao_id
          AND aa.entidade = _utf8mb4 'transferencia_turma' COLLATE utf8mb4_unicode_ci
          AND CAST(aa.entidade_id AS UNSIGNED) = tt.id
      )
    `,
    [organizacaoId]
  );
}

async function semearEventosLegados(organizacaoId) {
  await db.execute(
    `
    INSERT INTO auditoria_atividades (
      organizacao_id, usuario_id, usuario_nome, acao, entidade, entidade_id, descricao, metadata_json, created_at
    )
    SELECT
      a.organizacao_id,
      a.criado_por AS usuario_id,
      e.nome AS usuario_nome,
      'evento_criado' AS acao,
      'agenda' AS entidade,
      CAST(a.id AS CHAR) AS entidade_id,
      CONCAT('Criou evento: ', COALESCE(NULLIF(TRIM(a.titulo), ''), CONCAT('#', a.id))) AS descricao,
      JSON_OBJECT('origem', 'legado'),
      COALESCE(a.criado_em, a.data_inicio, NOW()) AS created_at
    FROM agenda a
    LEFT JOIN equipe e
      ON e.id = a.criado_por
      AND e.organizacao_id = a.organizacao_id
    WHERE a.organizacao_id = ?
      AND NOT EXISTS (
        SELECT 1
        FROM auditoria_atividades aa
        WHERE aa.organizacao_id = a.organizacao_id
          AND aa.entidade = _utf8mb4 'agenda' COLLATE utf8mb4_unicode_ci
          AND CAST(aa.entidade_id AS UNSIGNED) = a.id
      )
    `,
    [organizacaoId]
  );
}

async function semearNoticiasLegadas(organizacaoId) {
  const temOrgNaGaleria = await tabelaPossuiColuna("galeria", "organizacao_id");
  if (!temOrgNaGaleria) {
    logger.warn("[auditoria] Tabela galeria sem organizacao_id. Semeadura de notícias ignorada.");
    return;
  }

  await db.execute(
    `
    INSERT INTO auditoria_atividades (
      organizacao_id, usuario_id, usuario_nome, acao, entidade, entidade_id, descricao, metadata_json, created_at
    )
    SELECT
      g.organizacao_id,
      g.criado_por AS usuario_id,
      e.nome AS usuario_nome,
      'noticia_publicada' AS acao,
      'noticia' AS entidade,
      CAST(g.id AS CHAR) AS entidade_id,
      CONCAT('Publicou notícia: ', COALESCE(NULLIF(TRIM(g.titulo), ''), CONCAT('#', g.id))) AS descricao,
      JSON_OBJECT('origem', 'legado'),
      COALESCE(g.criado_em, NOW()) AS created_at
    FROM galeria g
    LEFT JOIN equipe e
      ON e.id = g.criado_por
      AND e.organizacao_id = g.organizacao_id
    WHERE g.organizacao_id = ?
      AND NOT EXISTS (
        SELECT 1
        FROM auditoria_atividades aa
        WHERE aa.organizacao_id = g.organizacao_id
          AND aa.entidade = _utf8mb4 'noticia' COLLATE utf8mb4_unicode_ci
          AND CAST(aa.entidade_id AS UNSIGNED) = g.id
      )
    `,
    [organizacaoId]
  );
}

async function semearAuditoriaLegada(organizacaoId) {
  if (!organizacaoId || orgsSemeadas.has(Number(organizacaoId))) return;
  try {
    await garantirTabelaAuditoria();
    await semearTransferenciasLegadas(organizacaoId);
    await semearEventosLegados(organizacaoId);
    await semearNoticiasLegadas(organizacaoId);
    orgsSemeadas.add(Number(organizacaoId));
  } catch (error) {
    logger.warn("[auditoria] Falha ao semear dados legados", {
      organizacaoId,
      erro: error.message,
    });
  }
}

async function listarAuditoriaPorOrganizacao(organizacaoId, limit = 100) {
  await garantirTabelaAuditoria();
  await semearAuditoriaLegada(organizacaoId);
  const limitSeguro = Math.max(1, Math.min(Number(limit) || 100, 500));
  const [rows] = await db.execute(
    `
    SELECT
      id,
      organizacao_id,
      usuario_id,
      usuario_nome,
      acao,
      entidade,
      entidade_id,
      descricao,
      metadata_json,
      created_at
    FROM auditoria_atividades
    WHERE organizacao_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT ${limitSeguro}
    `,
    [organizacaoId]
  );

  return rows.map((row) => {
    let metadata = null;
    if (row.metadata_json) {
      try {
        metadata = JSON.parse(row.metadata_json);
      } catch {
        metadata = null;
      }
    }
    return {
      ...row,
      metadata,
    };
  });
}

module.exports = {
  registrarAuditoria,
  listarAuditoriaPorOrganizacao,
  semearAuditoriaLegada,
};

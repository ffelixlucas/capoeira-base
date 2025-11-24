const db = require("../../database/connection");
const logger = require("../../utils/logger.js");

/* -------------------------------------------------------------------------- */
/* 🔍 Listar turmas da organização (com nome do instrutor e categoria)        */
/* -------------------------------------------------------------------------- */
async function buscarTodasComInstrutor(organizacaoId) {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        t.id,
        t.nome,
        t.faixa_etaria,
        t.idade_min,
        t.idade_max,
        t.categoria_id,
        t.equipe_id,
        e.nome AS nome_instrutor,
        c.nome AS nome_categoria
      FROM turmas t
      LEFT JOIN equipe e ON t.equipe_id = e.id
      LEFT JOIN categorias c ON t.categoria_id = c.id
      WHERE t.organizacao_id = ?
      ORDER BY t.nome ASC
      `,
      [organizacaoId]
    );
    logger.debug("[turmasRepository] Turmas carregadas", {
      total: rows.length,
    });
    return rows;
  } catch (error) {
    logger.error("[turmasRepository] Erro ao buscar turmas", {
      erro: error.message,
    });
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* ➕ Inserir nova turma                                                      */
/* -------------------------------------------------------------------------- */
async function inserirTurma({
  nome,
  faixa_etaria,
  equipe_id,
  organizacao_id,
  idade_min,
  idade_max,
  categoria_id,
}) {
  const sql = `
    INSERT INTO turmas (
      nome, faixa_etaria, equipe_id, organizacao_id, idade_min, idade_max, categoria_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    nome,
    faixa_etaria || null,
    equipe_id || null,
    organizacao_id,
    idade_min || null,
    idade_max || null,
    categoria_id || null,
  ];

  const [result] = await db.query(sql, params);
  logger.debug("[turmasRepository] Turma criada", {
    id: result.insertId,
    nome,
  });
  return { id: result.insertId };
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar turma existente                                               */
/* -------------------------------------------------------------------------- */
async function atualizarTurma(id, organizacaoId, dados) {
  const campos = [];
  const valores = [];
  const permitidos = [
    "nome",
    "faixa_etaria",
    "equipe_id",
    "idade_min",
    "idade_max",
    "categoria_id",
  ];

  permitidos.forEach((campo) => {
    if (dados[campo] !== undefined) {
      campos.push(`${campo} = ?`);
      valores.push(dados[campo]);
    }
  });

  if (campos.length === 0) return 0;

  const sql = `UPDATE turmas SET ${campos.join(", ")} WHERE id = ? AND organizacao_id = ?`;
  valores.push(id, organizacaoId);

  const [result] = await db.query(sql, valores);
  return result.affectedRows;
}

/* -------------------------------------------------------------------------- */
/* ❌ Deletar turma                                                          */
/* -------------------------------------------------------------------------- */
async function deletarTurma(id, organizacaoId) {
  const [result] = await db.query(
    "DELETE FROM turmas WHERE id = ? AND organizacao_id = ?",
    [id, organizacaoId]
  );

  logger.debug("[turmasRepository] Turma deletada", {
    id,
    afetados: result.affectedRows,
  });
  return result.affectedRows;
}

/* -------------------------------------------------------------------------- */
/* 👨‍🏫 Listar turmas por equipe                                             */
/* -------------------------------------------------------------------------- */
async function listarPorEquipe(equipeId, organizacaoId) {
  const [rows] = await db.query(
    `
    SELECT 
      t.*, e.nome AS nome_instrutor, c.nome AS nome_categoria
    FROM turmas t
    LEFT JOIN equipe e ON e.id = t.equipe_id
    LEFT JOIN categorias c ON c.id = t.categoria_id
    WHERE t.equipe_id = ? AND t.organizacao_id = ?
    ORDER BY t.nome ASC
    `,
    [equipeId, organizacaoId]
  );
  return rows;
}

/* -------------------------------------------------------------------------- */
/* 🔎 Verificar se há alunos vinculados à turma                               */
/* -------------------------------------------------------------------------- */
async function verificarVinculos(turmaId, organizacaoId) {
  const [rows] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM alunos a
    INNER JOIN matriculas m ON m.aluno_id = a.id
    WHERE m.turma_id = ? AND a.organizacao_id = ? AND m.data_fim IS NULL
    `,
    [turmaId, organizacaoId]
  );
  const total = rows[0]?.total || 0;
  return total > 0;
}

/* -------------------------------------------------------------------------- */
/* 🔥 NOVA FUNÇÃO — Buscar turma ideal pela idade                             */
/* -------------------------------------------------------------------------- */
async function buscarTurmaPorIdade(idade, organizacaoId) {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        nome,
        faixa_etaria,
        idade_min,
        idade_max
      FROM turmas
      WHERE organizacao_id = ?
      AND (
        (idade_min IS NOT NULL AND idade_max IS NOT NULL AND ? BETWEEN idade_min AND idade_max)
        OR (idade_min IS NOT NULL AND idade_max IS NULL AND ? >= idade_min)
        OR (idade_min IS NULL AND idade_max IS NOT NULL AND ? <= idade_max)
      )
      LIMIT 1
      `,
      [organizacaoId, idade, idade, idade]
    );

    return rows[0] || null;
  } catch (error) {
    logger.error("[turmasRepository] Erro ao buscar turma por idade", {
      idade,
      organizacaoId,
      erro: error.message,
    });
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
module.exports = {
  buscarTodasComInstrutor,
  inserirTurma,
  atualizarTurma,
  deletarTurma,
  listarPorEquipe,
  verificarVinculos,
  buscarTurmaPorIdade,
};

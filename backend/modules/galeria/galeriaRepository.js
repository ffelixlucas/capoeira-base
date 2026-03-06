const db = require('../../database/connection');

let hasOrganizacaoIdColumnCache = null;

async function galeriaHasOrganizacaoIdColumn() {
  if (hasOrganizacaoIdColumnCache !== null) return hasOrganizacaoIdColumnCache;

  const [rows] = await db.execute(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = 'galeria'
        AND column_name = 'organizacao_id'
      LIMIT 1
    `
  );

  hasOrganizacaoIdColumnCache = rows.length > 0;
  return hasOrganizacaoIdColumnCache;
}

async function contarTotalItens(organizacaoId = null) {
  const hasOrgColumn = await galeriaHasOrganizacaoIdColumn();
  if (hasOrgColumn && organizacaoId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as total FROM galeria WHERE organizacao_id = ?',
      [organizacaoId]
    );
    return rows[0].total;
  }
  const [rows] = await db.execute('SELECT COUNT(*) as total FROM galeria');
  return rows[0].total;
}

async function salvarImagem(imagemUrl, titulo = null, criadoPor = null, legenda = null, organizacaoId = null) {
  const hasOrgColumn = await galeriaHasOrganizacaoIdColumn();
  if (hasOrgColumn && organizacaoId) {
    const [resultado] = await db.execute(
      'INSERT INTO galeria (imagem_url, titulo, criado_por, legenda, organizacao_id) VALUES (?, ?, ?, ?, ?)',
      [imagemUrl, titulo, criadoPor, legenda, organizacaoId]
    );
    return resultado.insertId;
  }
  const [resultado] = await db.execute(
    'INSERT INTO galeria (imagem_url, titulo, criado_por, legenda) VALUES (?, ?, ?, ?)',
    [imagemUrl, titulo, criadoPor, legenda]
  );
  return resultado.insertId;
}

async function buscarTodasImagens(organizacaoId = null) {
  const hasOrgColumn = await galeriaHasOrganizacaoIdColumn();
  if (hasOrgColumn && organizacaoId) {
    const [linhas] = await db.execute(
      `SELECT g.*, e.nome AS criado_por_nome
       FROM galeria g
       LEFT JOIN equipe e
         ON e.id = g.criado_por
         AND e.organizacao_id = g.organizacao_id
       WHERE g.organizacao_id = ?
       ORDER BY g.ordem IS NULL, g.ordem ASC, g.criado_em DESC`,
      [organizacaoId]
    );
    return linhas;
  }
  const [linhas] = await db.execute(
    `SELECT g.*, e.nome AS criado_por_nome
     FROM galeria g
     LEFT JOIN equipe e ON e.id = g.criado_por
     ORDER BY g.ordem IS NULL, g.ordem ASC, g.criado_em DESC`
  );
  return linhas;
}

async function buscarImagensPublicas(organizacaoId = null) {
  const hasOrgColumn = await galeriaHasOrganizacaoIdColumn();

  if (hasOrgColumn && organizacaoId) {
    const [linhas] = await db.execute(
      `SELECT g.*, e.nome AS criado_por_nome
       FROM galeria g
       LEFT JOIN equipe e
         ON e.id = g.criado_por
         AND e.organizacao_id = g.organizacao_id
       WHERE g.organizacao_id = ?
       ORDER BY g.ordem IS NULL, g.ordem ASC, g.criado_em DESC`,
      [organizacaoId]
    );
    return linhas;
  }

  const [linhas] = await db.execute(
    `SELECT g.*, e.nome AS criado_por_nome
     FROM galeria g
     LEFT JOIN equipe e ON e.id = g.criado_por
     ORDER BY g.ordem IS NULL, g.ordem ASC, g.criado_em DESC`
  );
  return linhas;
}

async function atualizarOrdem(lista, organizacaoId = null) {
  const hasOrgColumn = await galeriaHasOrganizacaoIdColumn();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const item of lista) {
      if (hasOrgColumn && organizacaoId) {
        await conn.execute(
          'UPDATE galeria SET ordem = ? WHERE id = ? AND organizacao_id = ?',
          [item.ordem, item.id, organizacaoId]
        );
      } else {
        await conn.execute(
          'UPDATE galeria SET ordem = ? WHERE id = ?',
          [item.ordem, item.id]
        );
      }
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function buscarPorId(id, organizacaoId = null) {
  const hasOrgColumn = await galeriaHasOrganizacaoIdColumn();
  const [rows] = hasOrgColumn && organizacaoId
    ? await db.execute(
      'SELECT * FROM galeria WHERE id = ? AND organizacao_id = ?',
      [id, organizacaoId]
    )
    : await db.execute(
      'SELECT * FROM galeria WHERE id = ?',
      [id]
    );
  return rows[0];
}

async function excluir(id, organizacaoId = null) {
  const hasOrgColumn = await galeriaHasOrganizacaoIdColumn();
  if (hasOrgColumn && organizacaoId) {
    await db.execute(
      'DELETE FROM galeria WHERE id = ? AND organizacao_id = ?',
      [id, organizacaoId]
    );
    return;
  }
  await db.execute('DELETE FROM galeria WHERE id = ?', [id]);
}

async function atualizarNoticia(id, { titulo, legenda }, organizacaoId = null) {
  const hasOrgColumn = await galeriaHasOrganizacaoIdColumn();
  const [result] = hasOrgColumn && organizacaoId
    ? await db.execute(
      'UPDATE galeria SET titulo = ?, legenda = ? WHERE id = ? AND organizacao_id = ?',
      [titulo, legenda, id, organizacaoId]
    )
    : await db.execute(
      'UPDATE galeria SET titulo = ?, legenda = ? WHERE id = ?',
      [titulo, legenda, id]
    );
  return result;
}

module.exports = {
  salvarImagem,
  atualizarNoticia,
  buscarTodasImagens,
  buscarImagensPublicas,
  atualizarOrdem,
  buscarPorId,
  excluir,
  contarTotalItens,
};

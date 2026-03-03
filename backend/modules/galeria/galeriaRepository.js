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

async function contarTotalItens() {
  const [rows] = await db.execute('SELECT COUNT(*) as total FROM galeria');
  return rows[0].total;
}

async function salvarImagem(imagemUrl, titulo = null, criadoPor = null, legenda = null) {
  const [resultado] = await db.execute(
    'INSERT INTO galeria (imagem_url, titulo, criado_por, legenda) VALUES (?, ?, ?, ?)',
    [imagemUrl, titulo, criadoPor, legenda]
  );
  return resultado.insertId;
}

async function buscarTodasImagens() {
  const [linhas] = await db.execute(
    'SELECT * FROM galeria ORDER BY ordem IS NULL, ordem ASC, criado_em DESC'
  );
  return linhas;
}

async function buscarImagensPublicas(organizacaoId = null) {
  const hasOrgColumn = await galeriaHasOrganizacaoIdColumn();

  if (hasOrgColumn && organizacaoId) {
    const [linhas] = await db.execute(
      'SELECT * FROM galeria WHERE organizacao_id = ? ORDER BY ordem IS NULL, ordem ASC, criado_em DESC',
      [organizacaoId]
    );
    return linhas;
  }

  const [linhas] = await db.execute(
    'SELECT * FROM galeria ORDER BY ordem IS NULL, ordem ASC, criado_em DESC'
  );
  return linhas;
}

async function atualizarOrdem(lista) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const item of lista) {
      await conn.execute(
        'UPDATE galeria SET ordem = ? WHERE id = ?',
        [item.ordem, item.id]
      );
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

async function buscarPorId(id) {
  const [rows] = await db.execute(
    'SELECT * FROM galeria WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function excluir(id) {
  await db.execute(
    'DELETE FROM galeria WHERE id = ?',
    [id]
  );
}

async function atualizarNoticia(id, { titulo, legenda }) {
  const [result] = await db.execute(
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

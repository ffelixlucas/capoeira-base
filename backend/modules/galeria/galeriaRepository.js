const db = require('../../database/connection');

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
async function atualizarLegenda(id, legenda) {
  const [result] = await db.execute(
    'UPDATE galeria SET legenda = ? WHERE id = ?',
    [legenda, id]
  );
  return result;
}




module.exports = {
  salvarImagem,
  atualizarLegenda,
  buscarTodasImagens,
  atualizarOrdem,
  buscarPorId,
  excluir,
  contarTotalItens
};

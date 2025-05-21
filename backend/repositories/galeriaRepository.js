const db = require('../database/connection');

async function salvarImagem(imagemUrl, titulo = null, criadoPor = null) {
  const [resultado] = await db.execute(
    'INSERT INTO galeria (imagem_url, titulo, criado_por) VALUES (?, ?, ?)',
    [imagemUrl, titulo, criadoPor]
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

module.exports = {
  salvarImagem,
  buscarTodasImagens,
  atualizarOrdem
};

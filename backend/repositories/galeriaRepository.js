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

module.exports = {
  salvarImagem,
  buscarTodasImagens
};

const db = require('../database/connection');

async function buscarPorChave(chave) {
  const [rows] = await db.execute('SELECT * FROM configuracoes WHERE chave = ?', [chave]);
  return rows[0];
}

async function listarConfiguracoes() {
  const [rows] = await db.execute('SELECT * FROM configuracoes');
  return rows;
}

async function atualizarConfiguracao(chave, valor) {
  await db.execute(
    'INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
    [chave, valor, valor]
  );
}

module.exports = {
  buscarPorChave,
  listarConfiguracoes,
  atualizarConfiguracao
};

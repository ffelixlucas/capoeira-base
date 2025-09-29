// modules/graduacoes/graduacoesRepository.js
const db = require("../../database/connection");

async function listarPorCategoria(categoria) {
  const [rows] = await db.execute(
    "SELECT id, nome, ordem FROM graduacoes WHERE categoria = ? ORDER BY ordem",
    [categoria]
  );
  return rows;
}

async function listarTodas() {
  const [rows] = await db.execute(
    "SELECT id, categoria, nome, ordem FROM graduacoes ORDER BY categoria, ordem"
  );
  return rows;
}

module.exports = { listarPorCategoria, listarTodas };

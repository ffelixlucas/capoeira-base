// modules/categorias/categoriasRepository.js
const db = require("../../database/connection");
const { logger } = require("../../utils/logger");

// Lista todas as categorias
async function listarTodas() {
  logger.info("[categoriasRepository] Listando todas as categorias");

  const [rows] = await db.execute(
    "SELECT id, nome FROM categorias ORDER BY id ASC"
  );

  logger.debug("[categoriasRepository] Retorno da query:", rows);
  return rows;
}

// Busca categoria compatível com a idade
async function buscarPorIdade(idade) {
  logger.info("[categoriasRepository] buscando categoria por idade:", idade);

  const [rows] = await db.execute(
    `SELECT 
       t.id AS turma_id,
       t.nome AS turma_nome,
       t.faixa_etaria,
       t.categoria_id,
       c.nome AS categoria_nome
     FROM turmas t
     LEFT JOIN categorias c ON c.id = t.categoria_id
     WHERE (t.idade_min IS NULL OR t.idade_min <= ?)
       AND (t.idade_max IS NULL OR t.idade_max >= ?)
     ORDER BY 
       (t.idade_min IS NULL AND t.idade_max IS NULL) ASC,  -- coloca "sem turma" no fim
       t.idade_min ASC
     LIMIT 1`,
    [idade, idade]
  );
  

  logger.debug("[categoriasRepository] Resultado da busca:", rows);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = { listarTodas, buscarPorIdade };


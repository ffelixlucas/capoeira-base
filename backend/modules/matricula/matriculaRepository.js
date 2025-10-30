// 🎯 Repository da Matrícula (Admin)
// Responsável por criar aluno e matrícula após aprovação da pré-matrícula

const db = require("../../database/connection");
const logger = require("../../utils/logger");

/**
 * Verifica se já existe um aluno com o CPF informado
 */
async function buscarPorCpf(cpf) {
  const normalizado = cpf.replace(/\D/g, "");
  const [rows] = await db.execute("SELECT id FROM alunos WHERE cpf = ?", [
    normalizado,
  ]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Cria um novo aluno na tabela `alunos` + matrícula inicial
 */
async function criar(dados) {
  logger.debug(
    `[matriculaRepository] Iniciando criação de aluno (${dados.nome}) para org ${dados.organizacao_id}`
  );

  const sql = `
  INSERT INTO alunos (
    organizacao_id,
    nome, apelido, nascimento, cpf, email,
    telefone_aluno, telefone_responsavel, nome_responsavel, responsavel_documento, responsavel_parentesco,
    endereco, observacoes_medicas,
    autorizacao_imagem, aceite_lgpd, foto_url,
    turma_id, categoria_id, graduacao_id, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const params = [
  dados.organizacao_id,
  dados.nome,
  dados.apelido || null,
  dados.nascimento,
  dados.cpf,
  dados.email,
  dados.telefone_aluno || null,
  dados.telefone_responsavel || null,
  dados.nome_responsavel || null,
  dados.responsavel_documento || null,
  dados.responsavel_parentesco || null,
  dados.endereco || null,
  dados.observacoes_medicas || null,
  dados.autorizacao_imagem ? 1 : 0,
  dados.aceite_lgpd ? 1 : 0,
  dados.foto_url || null,
  dados.turma_id || null,
  dados.categoria_id || null,
  dados.graduacao_id || null,
  dados.status || "ativo",
];

  logger.debug("[matriculaRepository.criar] SQL (aluno):", sql.trim());
  logger.debug("[matriculaRepository.criar] Params:", params);

  const [result] = await db.execute(sql, params);
  const alunoId = result.insertId;
  logger.info(`[matriculaRepository] Aluno criado com ID ${alunoId}`);

  // 📘 Caso tenha turma, cria matrícula vinculada
  if (dados.turma_id) {
    const sqlMatricula = `
      INSERT INTO matriculas (aluno_id, turma_id, organizacao_id, data_inicio)
      VALUES (?, ?, ?, CURDATE())
    `;
    const paramsMatricula = [
      alunoId,
      dados.turma_id,
      dados.organizacao_id || null,
    ];

    logger.debug("[matriculaRepository] SQL (matrícula):", sqlMatricula.trim());
    logger.debug("[matriculaRepository] Params (matrícula):", paramsMatricula);

    const [matriculaResult] = await db.execute(sqlMatricula, paramsMatricula);
    logger.info(
      `[matriculaRepository] Matrícula criada com ID ${matriculaResult.insertId} para aluno ${alunoId}`
    );
  } else {
    logger.warn(
      `[matriculaRepository] Nenhuma turma atribuída — matrícula não criada (aluno ${alunoId})`
    );
  }

  return { id: alunoId, ...dados, status: "pendente" };
}

/**
 * Busca turma compatível com a idade informada
 */
async function buscarTurmaPorIdade(idade) {
  const [rows] = await db.execute(
    `SELECT 
       t.id AS turma_id,
       t.nome AS turma_nome,
       t.faixa_etaria,
       t.idade_min,
       t.idade_max,
       t.categoria_id,
       c.nome AS categoria_nome
     FROM turmas t
     LEFT JOIN categorias c ON c.id = t.categoria_id
     WHERE t.nome <> 'Sem turma'
       AND (t.idade_min IS NULL OR t.idade_min <= ?)
       AND (t.idade_max IS NULL OR t.idade_max >= ?)
     LIMIT 1`,
    [idade, idade]
  );

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Retorna o organizacao_id de uma turma
 */
async function buscarOrganizacaoPorTurmaId(turmaId) {
  const [rows] = await db.execute(
    "SELECT organizacao_id FROM turmas WHERE id = ?",
    [turmaId]
  );
  return rows.length > 0 ? rows[0].organizacao_id : null;
}

module.exports = {
  criar,
  buscarPorCpf,
  buscarTurmaPorIdade,
  buscarOrganizacaoPorTurmaId,
};

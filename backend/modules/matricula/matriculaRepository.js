// 🎯 Repository da Matrícula (Admin)
// Responsável por criar aluno e matrícula após aprovação da pré-matrícula

const db = require("../../database/connection");
const logger = require("../../utils/logger.js");

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
/**
 * Busca turma compatível com a idade informada e dentro da mesma organização
 */
async function buscarTurmaPorIdade(idade, organizacao_id) {
  try {
    const sql = `
      SELECT 
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
        AND t.organizacao_id = ?                      -- 🔹 filtro multi-org
        AND (t.idade_min IS NULL OR t.idade_min <= ?)
        AND (t.idade_max IS NULL OR t.idade_max >= ?)
      ORDER BY t.id
      LIMIT 1
    `;

    const params = [organizacao_id, idade, idade];
    logger.debug("[matriculaRepository.buscarTurmaPorIdade] SQL:", sql.trim());
    logger.debug("[matriculaRepository.buscarTurmaPorIdade] Params:", params);

    const [rows] = await db.execute(sql, params);

    if (rows.length > 0) {
      logger.info(
        `[matriculaRepository] org ${organizacao_id} - turma compatível encontrada (${rows[0].turma_nome})`
      );
      return rows[0];
    }

    logger.warn(
      `[matriculaRepository] org ${organizacao_id} - nenhuma turma encontrada para idade ${idade}`
    );
    return null;
  } catch (err) {
    logger.error(
      `[matriculaRepository.buscarTurmaPorIdade] Erro: ${err.message}`
    );
    throw err;
  }
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

/**
 * Busca dados completos para o e-mail de matrícula aprovada
 * (turma, dias, horários, responsável e endereço da organização)
 * Agora inclui também `professor_funcao`.
 */
async function buscarDadosEmailAprovacao(turmaId, organizacaoId) {
  const sql = `
    SELECT
      t.nome AS turma_nome,
      COALESCE(et.nome, eh.nome) AS professor_nome,                      -- responsável pelo aluno
      COALESCE(et.funcao, eh.funcao) AS professor_funcao,                -- NOVO: função/cargo (Instrutor, Professor, Mestre...)
      COALESCE(GROUP_CONCAT(DISTINCT h.dias ORDER BY h.id SEPARATOR ', '), '—') AS dias,
      COALESCE(GROUP_CONCAT(DISTINCT h.horario ORDER BY h.id SEPARATOR ', '), '—') AS horario,
      o.endereco,
      o.nome_fantasia,
      o.nome AS nome_organizacao
    FROM turmas t
    LEFT JOIN horarios_aula h 
           ON h.turma_id = t.id 
          AND h.organizacao_id = t.organizacao_id
    LEFT JOIN equipe et 
           ON et.id = t.equipe_id                                       -- responsável principal da turma
    LEFT JOIN equipe eh 
           ON eh.id = h.responsavel_id                                  -- responsável do horário (fallback)
    INNER JOIN organizacoes o 
            ON o.id = t.organizacao_id
    WHERE t.id = ? AND t.organizacao_id = ?
    GROUP BY t.id, turma_nome, professor_nome, professor_funcao, o.endereco, o.nome_fantasia, o.nome
    LIMIT 1
  `;

  const params = [turmaId, organizacaoId];

  // 🔎 Logs de depuração
  logger.debug(
    "[matriculaRepository.buscarDadosEmailAprovacao] SQL:",
    sql.trim()
  );
  logger.debug(
    "[matriculaRepository.buscarDadosEmailAprovacao] Params:",
    params
  );

  const [rows] = await db.execute(sql, params);

  if (!rows.length) {
    logger.warn(
      `[matriculaRepository.buscarDadosEmailAprovacao] Nenhum dado encontrado (turma_id=${turmaId}, org=${organizacaoId})`
    );
    return null;
  }

  const row = rows[0];

  logger.info(
    `[matriculaRepository.buscarDadosEmailAprovacao] OK (turma_id=${turmaId}, org=${organizacaoId}) → ` +
      `responsavel="${row.professor_funcao || "-"} ${row.professor_nome || "-"}", ` +
      `dias="${row.dias}", horario="${row.horario}"`
  );

  return row;
}

/**
 * Busca informações básicas da organização (para e-mail de recusa)
 */
async function buscarDadosOrganizacao(organizacaoId) {
  const sql = `
    SELECT 
      nome,
      nome_fantasia,
      telefone,
      email,
      endereco
    FROM organizacoes
    WHERE id = ?
    LIMIT 1
  `;

  const params = [organizacaoId];

  // 🔎 Logs de depuração
  logger.debug("[matriculaRepository.buscarDadosOrganizacao] SQL:", sql.trim());
  logger.debug("[matriculaRepository.buscarDadosOrganizacao] Params:", params);

  const [rows] = await db.execute(sql, params);

  if (!rows.length) {
    logger.warn(
      `[matriculaRepository.buscarDadosOrganizacao] Nenhuma organização encontrada (id=${organizacaoId})`
    );
    return null;
  }

  const row = rows[0];

  logger.info(
    `[matriculaRepository.buscarDadosOrganizacao] OK (org=${organizacaoId}) → ` +
      `nome_fantasia="${row.nome_fantasia || "-"}", telefone="${row.telefone || "-"}"`
  );

  return row;
}

module.exports = {
  criar,
  buscarPorCpf,
  buscarTurmaPorIdade,
  buscarOrganizacaoPorTurmaId,
  buscarDadosEmailAprovacao,
  buscarDadosOrganizacao,
};

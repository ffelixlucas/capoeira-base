// modules/public/matricula/matriculaRepository.js
// 🎯 Repository da Matrícula Pública
// Responsável por acessar o banco de dados.

const db = require("../../../database/connection");
const logger = require("../../../utils/logger");

/**
 * Verifica se já existe um aluno com o CPF informado
 */
async function buscarPorCpf(cpf) {
  // normaliza CPF → só números
  const normalizado = cpf.replace(/\D/g, "");

  const [rows] = await db.execute("SELECT id FROM alunos WHERE cpf = ?", [
    normalizado,
  ]);

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Busca turma pelo nome (Infantil, Juvenil, Adulto, etc.)
 */
async function buscarTurmaPorNome(nome) {
  const [rows] = await db.execute("SELECT id FROM turmas WHERE nome = ?", [
    nome,
  ]);
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * Cria um novo aluno na tabela `alunos` + matrícula inicial
 */
async function criar(dados) {
  const sql = `
    INSERT INTO alunos (
      organizacao_id,
      nome, apelido, nascimento, cpf, email,
      telefone_aluno, telefone_responsavel, nome_responsavel, responsavel_documento, responsavel_parentesco,
      endereco, graduacao, observacoes_medicas,
      autorizacao_imagem, aceite_lgpd, foto_url,
      turma_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    dados.organizacao_id || null,
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
    dados.graduacao || null,
    dados.observacoes_medicas || null,
    dados.autorizacao_imagem ? 1 : 0,
    dados.aceite_lgpd ? 1 : 0,
    dados.foto_url || null,
    dados.turma_id || null,
  ];

  const [result] = await db.execute(sql, params);

  // 🔎 Debug
  logger.debug("[matriculaRepository.criar] SQL enviado:", sql);
  logger.debug("[matriculaRepository.criar] Params:", params);

  const alunoId = result.insertId;

  if (dados.turma_id) {
    await db.execute(
      `INSERT INTO matriculas (aluno_id, turma_id, organizacao_id, data_inicio) VALUES (?, ?, ?, CURDATE())`,
      [alunoId, dados.turma_id, dados.organizacao_id || null]
    );
  }

  return { id: alunoId, ...dados, status: "pendente" };
}

/**
 * Busca turma compatível com a idade informada,
 * ignorando a turma "Sem turma" (usada apenas para realocação interna).
 */
async function buscarTurmaPorIdade(idade) {
  const [rows] = await db.execute(
    `SELECT id FROM turmas 
     WHERE nome <> 'Sem turma'
       AND (idade_min IS NULL OR idade_min <= ?) 
       AND (idade_max IS NULL OR idade_max >= ?)
     LIMIT 1`,
    [idade, idade]
  );
  return rows.length > 0 ? rows[0].id : null;
}

async function buscarOrganizacaoPorTurmaId(turmaId) {
  const [rows] = await db.execute(
    "SELECT organizacao_id FROM turmas WHERE id = ?",
    [turmaId]
  );
  return rows.length > 0 ? rows[0].organizacao_id : null;
}

async function buscarGrupoPorOrganizacaoId(organizacaoId) {
  const [rows] = await db.execute(
    "SELECT grupo FROM organizacoes WHERE id = ?",
    [organizacaoId]
  );
  return rows.length > 0 ? rows[0].grupo : null;
}


module.exports = {
  criar,
  buscarPorCpf,
  buscarTurmaPorNome,
  buscarTurmaPorIdade,
  buscarOrganizacaoPorTurmaId,
  buscarGrupoPorOrganizacaoId,
};

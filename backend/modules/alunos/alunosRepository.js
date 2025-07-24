// alunosRepository.js
const connection = require("../../database/connection");

// Lista todos os alunos com a turma atual (data_fim IS NULL)
async function listarAlunosComTurmaAtual() {
  const [rows] = await connection.execute(`
    SELECT 
      a.id,
      a.nome,
      a.apelido,
      t.nome AS turma,
      t.id AS turma_id
    FROM alunos a
    LEFT JOIN matriculas m ON m.aluno_id = a.id AND m.data_fim IS NULL
    LEFT JOIN turmas t ON t.id = m.turma_id
    ORDER BY a.nome
  `);
  return rows;
}

// Lista alunos filtrando por instrutor (equipe_id)
async function listarAlunosPorInstrutor(equipe_id) {
  const [rows] = await connection.execute(
    `
    SELECT a.id, a.nome, a.apelido, t.nome AS turma, t.id AS turma_id
    FROM alunos a
    JOIN matriculas m ON m.aluno_id = a.id AND m.data_fim IS NULL
    JOIN turmas t ON t.id = m.turma_id
    WHERE t.equipe_id = ?
    ORDER BY a.nome
  `,
    [equipe_id]
  );
  return rows;
}

// Busca aluno por ID
async function buscarPorId(id) {
  const [rows] = await connection.execute(`SELECT * FROM alunos WHERE id = ?`, [
    id,
  ]);
  return rows[0];
}

// Cria novo aluno
async function criarAluno(dados) {

  const {
    nome,
    apelido,
    nascimento,
    telefone_responsavel,
    nome_responsavel,
    endereco,
    graduacao,
    observacoes_medicas,
    turma_id,
  } = dados;

  const [result] = await connection.execute(
    `INSERT INTO alunos
    (nome, apelido, nascimento, telefone_responsavel, nome_responsavel, endereco, graduacao, observacoes_medicas)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nome ?? null,
      apelido ?? null,
      nascimento ?? null,
      telefone_responsavel ?? null,
      nome_responsavel ?? null,
      endereco ?? null,
      graduacao ?? null,
      observacoes_medicas ?? null,
    ]
  );

  const aluno_id = result.insertId;

  // Criar matrícula inicial vinculando à turma
  await connection.execute(
    `INSERT INTO matriculas (aluno_id, turma_id, data_inicio) VALUES (?, ?, CURDATE())`,
    [aluno_id, turma_id]
  );

  return aluno_id;
}

// Edita aluno existente
async function editarAluno(id, dados) {
  const campos = [
    "nome",
    "apelido",
    "nascimento",
    "telefone_responsavel",
    "nome_responsavel",
    "endereco",
    "graduacao",
    "observacoes_medicas",
    "foto_url",
  ];

  const sets = campos.map((c) => `${c} = ?`).join(", ");
  const valores = campos.map((c) => dados[c] ?? null); // <- aqui está a correção

  valores.push(id);

  await connection.execute(`UPDATE alunos SET ${sets} WHERE id = ?`, valores);
}


// Exclui aluno
async function excluirAluno(id) {
  await connection.execute(`DELETE FROM alunos WHERE id = ?`, [id]);
}

// Busca matrícula atual
async function buscarMatriculaAtual(aluno_id) {
  const [rows] = await connection.execute(
    `SELECT * FROM matriculas WHERE aluno_id = ? AND data_fim IS NULL`,
    [aluno_id]
  );
  return rows[0];
}

// Troca turma do aluno (encerra matrícula atual e cria nova)
async function trocarTurma(aluno_id, nova_turma_id) {
  await connection.execute(
    `UPDATE matriculas SET data_fim = CURDATE() WHERE aluno_id = ? AND data_fim IS NULL`,
    [aluno_id]
  );

  await connection.execute(
    `INSERT INTO matriculas (aluno_id, turma_id, data_inicio) VALUES (?, ?, CURDATE())`,
    [aluno_id, nova_turma_id]
  );
}

async function listarAlunosPorTurmas(turmaIds) {
  if (!turmaIds || turmaIds.length === 0) return [];

  const placeholders = turmaIds.map(() => "?").join(",");
  const [rows] = await connection.execute(
    `
    SELECT 
      a.id,
      a.nome,
      a.apelido,
      t.nome AS turma,
      t.id AS turma_id
    FROM alunos a
    JOIN matriculas m ON m.aluno_id = a.id AND m.data_fim IS NULL
    JOIN turmas t ON t.id = m.turma_id
    WHERE t.id IN (${placeholders})
    ORDER BY a.nome
    `,
    turmaIds
  );

  return rows;
}

module.exports = {
  listarAlunosComTurmaAtual,
  listarAlunosPorInstrutor,
  buscarPorId,
  criarAluno,
  editarAluno,
  excluirAluno,
  buscarMatriculaAtual,
  trocarTurma,
  listarAlunosPorTurmas,
};

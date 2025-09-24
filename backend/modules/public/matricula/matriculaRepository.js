// modules/public/matricula/matriculaRepository.js
// 🎯 Repository da Matrícula Pública
// Responsável por acessar o banco de dados.

const db = require("../../../database/connection");

/**
 * Verifica se já existe um aluno com o CPF informado
 */
async function buscarPorCpf(cpf) {
  const [rows] = await db.execute("SELECT id FROM alunos WHERE cpf = ?", [cpf]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Busca turma pelo nome (Infantil, Juvenil, Adulto, etc.)
 */
async function buscarTurmaPorNome(nome) {
  const [rows] = await db.execute("SELECT id FROM turmas WHERE nome = ?", [nome]);
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * Cria um novo aluno na tabela `alunos` + matrícula inicial
 */
async function criar(dados) {
  const sql = `
    INSERT INTO alunos (
      nome, apelido, nascimento, cpf, email,
      telefone_responsavel, nome_responsavel, responsavel_documento, responsavel_parentesco,
      endereco, graduacao, observacoes_medicas,
      autorizacao_imagem, aceite_lgpd, foto_url,
      status, criado_em, atualizado_em, turma_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', NOW(), NOW(), ?)
  `;

  const params = [
    dados.nome,
    dados.apelido || null,
    dados.nascimento,
    dados.cpf,
    dados.email,
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
  const alunoId = result.insertId;

  // ✅ Criar matrícula inicial vinculada à turma
  if (dados.turma_id) {
    await db.execute(
      `INSERT INTO matriculas (aluno_id, turma_id, data_inicio) VALUES (?, ?, CURDATE())`,
      [alunoId, dados.turma_id]
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

module.exports = { criar, buscarPorCpf, buscarTurmaPorNome, buscarTurmaPorIdade };

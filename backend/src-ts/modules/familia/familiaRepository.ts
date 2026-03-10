import db from "../../database/connection";

export interface FamiliaAcesso {
  id: number;
  organizacao_id: number;
  cpf: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  firebase_uid: string;
  provider: string | null;
  status: "ativo" | "bloqueado";
  ultimo_acesso: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface FamiliaAluno {
  id: number;
  organizacao_id: number;
  nome: string;
  apelido: string | null;
  nascimento: string | null;
  email: string | null;
  telefone_aluno: string | null;
  telefone_responsavel: string | null;
  nome_responsavel: string | null;
  responsavel_documento: string | null;
  responsavel_parentesco: string | null;
  endereco: string | null;
  observacoes_medicas: string | null;
  autorizacao_imagem: number | null;
  aceite_lgpd: number | null;
  foto_url: string | null;
  turma_id: number | null;
  turma_nome: string | null;
  categoria_nome: string | null;
  graduacao_nome: string | null;
  status: string;
}

let tabelaPronta = false;

async function garantirTabelaFamilia() {
  if (tabelaPronta) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS familia_acessos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organizacao_id INT NOT NULL,
      cpf VARCHAR(14) NOT NULL,
      nome VARCHAR(180) NOT NULL,
      email VARCHAR(180) NULL,
      telefone VARCHAR(30) NULL,
      firebase_uid VARCHAR(128) NOT NULL,
      provider VARCHAR(60) NULL,
      status ENUM('ativo', 'bloqueado') NOT NULL DEFAULT 'ativo',
      ultimo_acesso DATETIME NULL,
      criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_familia_org_cpf (organizacao_id, cpf),
      UNIQUE KEY uq_familia_org_uid (organizacao_id, firebase_uid),
      INDEX idx_familia_org_status (organizacao_id, status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  tabelaPronta = true;
}

export async function buscarPorCpf(
  organizacaoId: number,
  cpf: string
): Promise<FamiliaAcesso | null> {
  await garantirTabelaFamilia();

  const [rows] = await db.execute<FamiliaAcesso[]>(
    `
    SELECT *
    FROM familia_acessos
    WHERE organizacao_id = ?
      AND cpf = ?
    LIMIT 1
    `,
    [organizacaoId, cpf]
  );

  return rows[0] || null;
}

export async function buscarPorFirebaseUid(
  organizacaoId: number,
  firebaseUid: string
): Promise<FamiliaAcesso | null> {
  await garantirTabelaFamilia();

  const [rows] = await db.execute<FamiliaAcesso[]>(
    `
    SELECT *
    FROM familia_acessos
    WHERE organizacao_id = ?
      AND firebase_uid = ?
    LIMIT 1
    `,
    [organizacaoId, firebaseUid]
  );

  return rows[0] || null;
}

export async function buscarPorId(
  id: number,
  organizacaoId: number
): Promise<FamiliaAcesso | null> {
  await garantirTabelaFamilia();

  const [rows] = await db.execute<FamiliaAcesso[]>(
    `
    SELECT *
    FROM familia_acessos
    WHERE id = ?
      AND organizacao_id = ?
    LIMIT 1
    `,
    [id, organizacaoId]
  );

  return rows[0] || null;
}

type CriarFamiliaAcessoPayload = {
  organizacaoId: number;
  cpf: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  firebaseUid: string;
  provider: string | null;
};

export async function criarAcesso(
  payload: CriarFamiliaAcessoPayload
): Promise<number> {
  await garantirTabelaFamilia();

  const [result]: any = await db.execute(
    `
    INSERT INTO familia_acessos (
      organizacao_id,
      cpf,
      nome,
      email,
      telefone,
      firebase_uid,
      provider,
      status,
      ultimo_acesso
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo', NOW())
    `,
    [
      payload.organizacaoId,
      payload.cpf,
      payload.nome,
      payload.email,
      payload.telefone,
      payload.firebaseUid,
      payload.provider,
    ]
  );

  return Number(result.insertId);
}

type AtualizarFamiliaAcessoPayload = {
  id: number;
  organizacaoId: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  firebaseUid: string;
  provider: string | null;
  status?: "ativo" | "bloqueado";
};

export async function atualizarAcesso(
  payload: AtualizarFamiliaAcessoPayload
): Promise<void> {
  await garantirTabelaFamilia();

  await db.execute(
    `
    UPDATE familia_acessos
    SET
      nome = ?,
      email = ?,
      telefone = ?,
      firebase_uid = ?,
      provider = ?,
      status = ?,
      ultimo_acesso = NOW()
    WHERE id = ?
      AND organizacao_id = ?
    `,
    [
      payload.nome,
      payload.email,
      payload.telefone,
      payload.firebaseUid,
      payload.provider,
      payload.status || "ativo",
      payload.id,
      payload.organizacaoId,
    ]
  );
}

export async function listarAlunosVinculados(
  organizacaoId: number,
  responsavelCpf: string
): Promise<FamiliaAluno[]> {
  const [rows] = await db.execute<FamiliaAluno[]>(
    `
    SELECT
      a.id,
      a.organizacao_id,
      a.nome,
      a.apelido,
      DATE_FORMAT(a.nascimento, '%Y-%m-%d') AS nascimento,
      a.email,
      a.telefone_aluno,
      a.telefone_responsavel,
      a.nome_responsavel,
      a.responsavel_documento,
      a.responsavel_parentesco,
      a.endereco,
      a.observacoes_medicas,
      a.autorizacao_imagem,
      a.aceite_lgpd,
      a.foto_url,
      a.status,
      t.id AS turma_id,
      t.nome AS turma_nome,
      c.nome AS categoria_nome,
      g.nome AS graduacao_nome
    FROM alunos a
    LEFT JOIN matriculas m
      ON m.aluno_id = a.id
      AND m.organizacao_id = a.organizacao_id
      AND m.data_fim IS NULL
    LEFT JOIN turmas t ON t.id = m.turma_id
    LEFT JOIN categorias c ON c.id = a.categoria_id
    LEFT JOIN graduacoes g ON g.id = a.graduacao_id
    WHERE a.organizacao_id = ?
      AND REPLACE(REPLACE(REPLACE(COALESCE(a.responsavel_documento, ''), '.', ''), '-', ''), ' ', '') = ?
      AND a.status = 'ativo'
    ORDER BY a.nome ASC
    `,
    [organizacaoId, responsavelCpf]
  );

  return rows;
}

export async function buscarAlunoVinculado(
  organizacaoId: number,
  responsavelCpf: string,
  alunoId: number
): Promise<FamiliaAluno | null> {
  const [rows] = await db.execute<FamiliaAluno[]>(
    `
    SELECT
      a.id,
      a.organizacao_id,
      a.nome,
      a.apelido,
      DATE_FORMAT(a.nascimento, '%Y-%m-%d') AS nascimento,
      a.email,
      a.telefone_aluno,
      a.telefone_responsavel,
      a.nome_responsavel,
      a.responsavel_documento,
      a.responsavel_parentesco,
      a.endereco,
      a.observacoes_medicas,
      a.autorizacao_imagem,
      a.aceite_lgpd,
      a.foto_url,
      a.status,
      t.id AS turma_id,
      t.nome AS turma_nome,
      c.nome AS categoria_nome,
      g.nome AS graduacao_nome
    FROM alunos a
    LEFT JOIN matriculas m
      ON m.aluno_id = a.id
      AND m.organizacao_id = a.organizacao_id
      AND m.data_fim IS NULL
    LEFT JOIN turmas t ON t.id = m.turma_id
    LEFT JOIN categorias c ON c.id = a.categoria_id
    LEFT JOIN graduacoes g ON g.id = a.graduacao_id
    WHERE a.id = ?
      AND a.organizacao_id = ?
      AND REPLACE(REPLACE(REPLACE(COALESCE(a.responsavel_documento, ''), '.', ''), '-', ''), ' ', '') = ?
    LIMIT 1
    `,
    [alunoId, organizacaoId, responsavelCpf]
  );

  return rows[0] || null;
}

export async function atualizarAlunoVinculado(
  organizacaoId: number,
  responsavelCpf: string,
  alunoId: number,
  dados: Record<string, any>
): Promise<void> {
  const aluno = await buscarAlunoVinculado(organizacaoId, responsavelCpf, alunoId);
  if (!aluno) {
    throw new Error("Aluno não encontrado para este responsável.");
  }

  const camposPermitidos = [
    "nome",
    "apelido",
    "nascimento",
    "email",
    "telefone_aluno",
    "telefone_responsavel",
    "nome_responsavel",
    "responsavel_parentesco",
    "endereco",
    "observacoes_medicas",
    "autorizacao_imagem",
    "aceite_lgpd",
  ];

  const campos: string[] = [];
  const valores: any[] = [];

  for (const campo of camposPermitidos) {
    if (Object.prototype.hasOwnProperty.call(dados, campo)) {
      campos.push(`${campo} = ?`);
      valores.push(dados[campo] === "" ? null : dados[campo]);
    }
  }

  if (!campos.length) return;

  await db.execute(
    `
    UPDATE alunos
    SET ${campos.join(", ")}
    WHERE id = ?
      AND organizacao_id = ?
      AND REPLACE(REPLACE(REPLACE(COALESCE(responsavel_documento, ''), '.', ''), '-', ''), ' ', '') = ?
    `,
    [...valores, alunoId, organizacaoId, responsavelCpf]
  );
}

export async function buscarMetricasAluno(
  organizacaoId: number,
  alunoId: number,
  inicio: string,
  fim: string
) {
  const [rows] = await db.execute<any[]>(
    `
    SELECT
      SUM(CASE WHEN status = 'presente' THEN 1 ELSE 0 END) AS presentes,
      SUM(CASE WHEN status = 'falta' THEN 1 ELSE 0 END) AS faltas,
      COUNT(*) AS total
    FROM presencas
    WHERE organizacao_id = ?
      AND aluno_id = ?
      AND DATE(data) BETWEEN ? AND ?
    `,
    [organizacaoId, alunoId, inicio, fim]
  );

  return {
    presentes: Number(rows[0]?.presentes || 0),
    faltas: Number(rows[0]?.faltas || 0),
    total: Number(rows[0]?.total || 0),
  };
}

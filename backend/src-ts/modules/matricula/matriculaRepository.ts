import db from "../../database/connection";
import  logger  from "../../utils/logger";

/* -------------------------------------------------------------------------- */
/* 🔹 Tipagem opcional do payload de criação                                  */
/* -------------------------------------------------------------------------- */
export interface DadosCriarMatricula {
  organizacao_id: number;
  nome: string;
  cpf: string;
  nascimento?: string;
  email?: string;
  apelido?: string | null;
  telefone_aluno?: string | null;
  telefone_responsavel?: string | null;
  nome_responsavel?: string | null;
  responsavel_documento?: string | null;
  responsavel_parentesco?: string | null;
  endereco?: string | null;
  observacoes_medicas?: string | null;
  autorizacao_imagem?: number | boolean;
  aceite_lgpd?: number | boolean;
  
  foto_url?: string | null;
  turma_id?: number | null;
  categoria_id?: number | null;
  graduacao_id?: number | null;
  status?: string;
  criado_por?: number | null;

}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar aluno por CPF                                                     */
/* -------------------------------------------------------------------------- */
async function buscarPorCpf(cpf: string, organizacao_id: number) {
  const normalizado = cpf.replace(/\D/g, "");

  const [rows]: any = await db.execute(
    "SELECT * FROM alunos WHERE cpf = ? AND organizacao_id = ? LIMIT 1",
    [normalizado, organizacao_id]
  );

  return rows.length ? rows[0] : null;
}


/* -------------------------------------------------------------------------- */
/* 🔹 Criar aluno + matrícula inicial                                          */
/* -------------------------------------------------------------------------- */
async function criar(dados: DadosCriarMatricula) {
  try {
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

    logger.debug("[matriculaRepository.criar] SQL:", sql.trim());
    logger.debug("[matriculaRepository.criar] Params:", params);

    const [result]: any = await db.execute(sql, params);
    const alunoId = result.insertId;

    logger.info(
      `[matriculaRepository] Aluno criado com ID ${alunoId} (org ${dados.organizacao_id})`
    );

    // Criar matrícula, se tiver turma
    if (dados.turma_id) {
      const sqlMatricula = `
        INSERT INTO matriculas (aluno_id, turma_id, organizacao_id, data_inicio)
        VALUES (?, ?, ?, CURDATE())
      `;

      const paramsMatricula = [
        alunoId,
        dados.turma_id,
        dados.organizacao_id,
      ];

      logger.debug(
        "[matriculaRepository] SQL (matrícula):",
        sqlMatricula.trim()
      );
      logger.debug(
        "[matriculaRepository] Params (matrícula):",
        paramsMatricula
      );

      const [matriculaResult]: any = await db.execute(
        sqlMatricula,
        paramsMatricula
      );

      logger.info(
        `[matriculaRepository] Matrícula criada com ID ${matriculaResult.insertId} para aluno ${alunoId}`
      );
    } else {
      logger.warn(
        `[matriculaRepository] Nenhuma turma atribuída — matrícula não criada (aluno ${alunoId})`
      );
    }

    return { id: alunoId, ...dados, status: "ativo" };
  } catch (err: any) {
    logger.error("[matriculaRepository.criar] Erro:", err.message);
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar turma compatível por idade (multi-org + logs completos)          */
/* -------------------------------------------------------------------------- */
async function buscarTurmaPorIdade(idade: number, organizacao_id: number) {
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
        AND t.organizacao_id = ?
        AND (t.idade_min IS NULL OR t.idade_min <= ?)
        AND (t.idade_max IS NULL OR t.idade_max >= ?)
      ORDER BY t.id
      LIMIT 1;
    `;

    const params = [organizacao_id, idade, idade];

    logger.debug("[matriculaRepository.buscarTurmaPorIdade] SQL:", sql.trim());
    logger.debug("[matriculaRepository.buscarTurmaPorIdade] Params:", params);

    const [rows]: any = await db.execute(sql, params);

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
  } catch (err: any) {
    logger.error(
      `[matriculaRepository.buscarTurmaPorIdade] Erro: ${err.message}`
    );
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar organizacao_id pela turma                                        */
/* -------------------------------------------------------------------------- */
async function buscarOrganizacaoPorTurmaId(turmaId: number) {
  const [rows]: any = await db.execute(
    "SELECT organizacao_id FROM turmas WHERE id = ? LIMIT 1",
    [turmaId]
  );
  return rows.length ? rows[0].organizacao_id : null;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Dados completos para e-mail de matrícula aprovada                       */
/* -------------------------------------------------------------------------- */
async function buscarDadosEmailAprovacao(
  turmaId: number,
  organizacaoId: number
) {
  const sql = `
    SELECT
      t.nome AS turma_nome,
      COALESCE(et.nome, eh.nome) AS professor_nome,
      COALESCE(et.funcao, eh.funcao) AS professor_funcao,
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
           ON et.id = t.equipe_id
    LEFT JOIN equipe eh 
           ON eh.id = h.responsavel_id
    INNER JOIN organizacoes o 
            ON o.id = t.organizacao_id
    WHERE t.id = ? AND t.organizacao_id = ?
    GROUP BY t.id, turma_nome, professor_nome, professor_funcao, o.endereco, o.nome_fantasia, o.nome
    LIMIT 1;
  `;

  const params = [turmaId, organizacaoId];

  logger.debug(
    "[matriculaRepository.buscarDadosEmailAprovacao] SQL:",
    sql.trim()
  );
  logger.debug(
    "[matriculaRepository.buscarDadosEmailAprovacao] Params:",
    params
  );

  const [rows]: any = await db.execute(sql, params);

  if (!rows.length) {
    logger.warn(
      `[matriculaRepository.buscarDadosEmailAprovacao] Nenhum dado encontrado (turma_id=${turmaId}, org=${organizacaoId})`
    );
    return null;
  }

  const row = rows[0];

  logger.info(
    `[matriculaRepository.buscarDadosEmailAprovacao] OK (turma_id=${turmaId}, org=${organizacaoId})`
  );

  return row;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar dados básicos da organização                                      */
/* -------------------------------------------------------------------------- */
async function buscarDadosOrganizacao(orgId: number) {
  const sql = `
    SELECT 
      nome,
      nome_fantasia,
      telefone,
      email,
      endereco
    FROM organizacoes
    WHERE id = ?
    LIMIT 1;
  `;

  const params = [orgId];

  logger.debug(
    "[matriculaRepository.buscarDadosOrganizacao] SQL:",
    sql.trim()
  );
  logger.debug(
    "[matriculaRepository.buscarDadosOrganizacao] Params:",
    params
  );

  const [rows]: any = await db.execute(sql, params);
  return rows.length ? rows[0] : null;
}

export default {
  buscarPorCpf,
  criar,
  buscarTurmaPorIdade,
  buscarOrganizacaoPorTurmaId,
  buscarDadosEmailAprovacao,
  buscarDadosOrganizacao,
};

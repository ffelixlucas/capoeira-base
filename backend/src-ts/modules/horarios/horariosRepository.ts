import db from "../../database/connection";
import logger from "../../utils/logger";

export interface DadosCriarHorario {
  organizacao_id: number;
  turma_id: number;
  dias: string;
  horario: string;
  responsavel_id?: number | null;
  ordem?: number | null;
}

/* -------------------------------------------------------------------------- */
/* ➕ Criar horário                                                             */
/* -------------------------------------------------------------------------- */
async function criarHorario(dados: DadosCriarHorario) {
  const sql = `
    INSERT INTO horarios_aula
      (organizacao_id, turma_id, dias, horario, responsavel_id, ordem)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    dados.organizacao_id,
    dados.turma_id,
    dados.dias,
    dados.horario,
    dados.responsavel_id || null,
    dados.ordem ?? 0,
  ];

  logger.debug("[horariosRepository] Criando horário", { sql, params });

  const [result]: any = await db.execute(sql, params);

  return { id: result.insertId, ...dados };
}

/* -------------------------------------------------------------------------- */
/* 🔍 Listar horários por turma                                               */
/* -------------------------------------------------------------------------- */
async function listarPorTurma(turma_id: number, organizacao_id: number) {
  const sql = `
    SELECT id, dias, horario, responsavel_id, ordem
    FROM horarios_aula
    WHERE turma_id = ? AND organizacao_id = ?
    ORDER BY ordem ASC, id ASC
  `;

  const params = [turma_id, organizacao_id];

  logger.debug("[horariosRepository] Listando horários", { sql, params });

  const [rows]: any = await db.execute(sql, params);
  return rows;
}

/* -------------------------------------------------------------------------- */
/* ❌ Deletar horário                                                          */
/* -------------------------------------------------------------------------- */
async function deletarHorario(id: number, organizacao_id: number) {
  const sql = `
    DELETE FROM horarios_aula
    WHERE id = ? AND organizacao_id = ?
    LIMIT 1
  `;

  const params = [id, organizacao_id];

  logger.debug("[horariosRepository] Deletando horário", { sql, params });

  await db.execute(sql, params);
  return true;
}

export default {
  criarHorario,
  listarPorTurma,
  deletarHorario,
};

import { db } from "../../../database/connection";
import logger from "../../../utils/logger";

export interface PreMatriculaRow {
  id: number;
  nome: string;
  apelido: string | null;
  nascimento: string;
  cpf: string;
  email: string;
  telefone_aluno: string | null;
  telefone_responsavel: string | null;
  nome_responsavel: string | null;
  responsavel_documento: string | null;
  responsavel_parentesco: string | null;
  endereco: string | null;
  ja_treinou: string;
  grupo_origem: string | null;
  categoria_id: number | null;
  graduacao_id: number | null;
  observacoes_medicas: string | null;
  autorizacao_imagem: number;
  aceite_lgpd: number;
  foto_url: string | null;
  status: string;
  criado_em: string;

  organizacao_id: number;
}

class PreMatriculasRepository {
  async verificarCpfExistente(cpf: string, organizacao_id: number) {
    try {
      const cpfLimpo = cpf.replace(/\D/g, "");

      const [rows] = await db.execute<any[]>(
        "SELECT id FROM pre_matriculas WHERE cpf = ? AND organizacao_id = ? LIMIT 1",
        [cpfLimpo, organizacao_id]
      );

      return rows.length > 0;
    } catch (err: any) {
      logger.error(
        "[preMatriculasRepository] Erro ao verificar CPF existente:",
        err.message
      );
      throw err;
    }
  }

  async verificarCpfEmAlunos(cpf: string, organizacao_id: number) {
    try {
      const cpfLimpo = cpf.replace(/\D/g, "");

      const [rows] = await db.execute<any[]>(
        "SELECT id FROM alunos WHERE cpf = ? AND organizacao_id = ? LIMIT 1",
        [cpfLimpo, organizacao_id]
      );

      return rows.length > 0;
    } catch (err: any) {
      logger.error(
        "[preMatriculasRepository] Erro ao verificar CPF em alunos:",
        err.message
      );
      throw err;
    }
  }

  async criarPreMatricula(dados: any) {
    try {
      const sql = `
        INSERT INTO pre_matriculas (
          organizacao_id,
          nome,
          apelido,
          nascimento,
          cpf,
          email,
          telefone_aluno,
          telefone_responsavel,
          nome_responsavel,
          responsavel_documento,
          responsavel_parentesco,
          endereco,
          ja_treinou,
          grupo_origem,
          categoria_id,
          graduacao_id,
          observacoes_medicas,
          autorizacao_imagem,
          aceite_lgpd,
          foto_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        dados.organizacao_id,
        dados.nome,
        dados.apelido || null,
        dados.nascimento,
        dados.cpf,
        dados.email,
        dados.telefone_aluno,
        dados.telefone_responsavel,
        dados.nome_responsavel,
        dados.responsavel_documento,
        dados.responsavel_parentesco,
        dados.endereco,
        dados.ja_treinou,
        dados.grupo_origem,
        dados.categoria_id,
        dados.graduacao_id,
        dados.observacoes_medicas,
        dados.autorizacao_imagem,
        dados.aceite_lgpd,
        dados.foto_url,
      ];

      const [result]: any = await db.execute(sql, params);
      return result.insertId;
    } catch (err: any) {
      logger.error(
        "[preMatriculasRepository] Erro ao criar pré-matrícula:",
        err.message
      );
      throw err;
    }
  }

  async listarPendentes(organizacaoId: number) {
    try {
      const sql = `
        SELECT 
          pm.id,
          pm.nome,
          pm.apelido,
          pm.nascimento,
          pm.cpf,
          pm.email,
          pm.telefone_aluno,
          pm.telefone_responsavel,
          pm.ja_treinou,
          pm.grupo_origem,
          pm.observacoes_medicas,
          pm.endereco,
          pm.foto_url,
          pm.status,

          pm.categoria_id,      -- ✔ ADICIONAR
          pm.graduacao_id,      -- ✔ ADICIONAR

          pm.criado_em,

          g.nome AS graduacao_nome,
          c.nome AS categoria_nome
        FROM pre_matriculas pm
        LEFT JOIN graduacoes g ON pm.graduacao_id = g.id
        LEFT JOIN categorias c ON pm.categoria_id = c.id
        WHERE pm.status = 'pendente'
          AND pm.organizacao_id = ?
        ORDER BY pm.criado_em DESC

      `;

      const [rows] = await db.execute<any[]>(sql, [organizacaoId]);
      return rows;
    } catch (err: any) {
      logger.error(
        `[preMatriculasRepository] Erro ao listar pendentes (org ${organizacaoId}):`,
        err.message
      );
      throw err;
    }
  }

  async atualizarStatus(id: number, status: string, organizacaoId: number) {
    try {
      const [result]: any = await db.execute(
        `
        UPDATE pre_matriculas 
        SET status = ?, atualizado_em = NOW() 
        WHERE id = ? AND organizacao_id = ?
        `,
        [status, id, organizacaoId]
      );

      if (result.affectedRows === 0) {
        throw new Error("Pré-matrícula não encontrada para esta organização.");
      }

      return true;
    } catch (err: any) {
      logger.error(
        "[preMatriculasRepository] Erro ao atualizar status:",
        err.message
      );
      throw err;
    }
  }

  async buscarPorId(id: number, organizacao_id: number) {
    try {
      const sql = `
        SELECT 
          pm.*,
          c.nome AS categoria_nome,
          g.nome AS graduacao_nome
        FROM pre_matriculas pm
        LEFT JOIN categorias c ON pm.categoria_id = c.id
        LEFT JOIN graduacoes g ON pm.graduacao_id = g.id
        WHERE pm.id = ? AND pm.organizacao_id = ?
        LIMIT 1
      `;

      const [rows] = await db.execute<PreMatriculaRow[]>(sql, [
        id,
        organizacao_id,
      ]);

      return rows.length ? rows[0] : null;
    } catch (err: any) {
      logger.error(
        `[preMatriculasRepository] Erro ao buscar pré-matrícula (id ${id}, org ${organizacao_id}):`,
        err.message
      );
      throw err;
    }
  }

  async deletar(id: number, organizacao_id: number) {
    try {
      const [result]: any = await db.execute(
        "DELETE FROM pre_matriculas WHERE id = ? AND organizacao_id = ?",
        [id, organizacao_id]
      );

      return result.affectedRows > 0;
    } catch (err: any) {
      logger.error(
        `[preMatriculasRepository] Erro ao deletar pré-matrícula ${id}:`,
        err.message
      );
      throw err;
    }
  }

  async buscarGrupoPorOrganizacaoId(organizacaoId: number) {
    try {
      const [rows] = await db.execute<any[]>(
        "SELECT nome, nome_fantasia, grupo FROM organizacoes WHERE id = ?",
        [organizacaoId]
      );

      return rows.length ? rows[0] : null;
    } catch (err: any) {
      logger.error(
        `[preMatriculasRepository] Erro ao buscar dados da organização (id ${organizacaoId}):`,
        err.message
      );
      throw err;
    }
  }

  async buscarTurmaPorIdade(organizacaoId: number, idade: number) {
    try {
      const sql = `
        SELECT
          t.id AS turma_id,
          t.nome AS turma_nome,
          t.idade_min,
          t.idade_max,
          t.categoria_id,
          c.nome AS categoria_nome
        FROM turmas t
        LEFT JOIN categorias c ON c.id = t.categoria_id
        WHERE t.organizacao_id = ?
          AND t.is_fallback = 0
          AND (t.idade_min IS NULL OR t.idade_min <= ?)
          AND (t.idade_max IS NULL OR t.idade_max >= ?)
        ORDER BY t.idade_min ASC, t.idade_max ASC
        LIMIT 1
      `;

      const [rows] = await db.execute<any[]>(sql, [
        organizacaoId,
        idade,
        idade,
      ]);

      return rows.length ? rows[0] : null;
    } catch (err: any) {
      logger.error(
        `[preMatriculasRepository] Erro ao buscar turma por idade (org ${organizacaoId}):`,
        err.message
      );
      throw err;
    }
  }
}

export default new PreMatriculasRepository();

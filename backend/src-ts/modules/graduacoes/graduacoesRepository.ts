// modules/graduacoes/graduacoesRepository.ts
import db from "../../database/connection";
import  logger  from "../../utils/logger";

/* ========================================================================== */
/* 🎭 TIPAGENS                                                                */
/* ========================================================================== */

export interface GraduacaoRow {
  id: number;
  nome: string;
  ordem: number;
  categoria_id: number;
  organizacao_id: number;
}

export interface CriarGraduacaoDTO {
  nome: string;
  ordem: number;
  categoriaId: number;
  organizacaoId: number;
}

export interface AtualizarGraduacaoDTO {
  nome: string;
  ordem: number;
  organizacaoId: number;
}

/* ========================================================================== */
/* 🔍 Listar por categoria                                                    */
/* ========================================================================== */
async function listarPorCategoria(
  categoriaId: number | string,
  organizacaoId: number
): Promise<GraduacaoRow[]> {
  logger.debug("[graduacoesRepository] listarPorCategoria", {
    categoriaId,
    organizacaoId,
  });

  const [rows] = await db.execute<GraduacaoRow[]>(
    `
    SELECT id, nome, ordem
    FROM graduacoes
    WHERE categoria_id = ?
      AND organizacao_id = ?
    ORDER BY ordem ASC
  `,
    [categoriaId, organizacaoId]
  );

  return rows;
}

/* ========================================================================== */
/* 🔍 Listar todas (com nome da categoria)                                    */
/* ========================================================================== */
async function listarTodas(
  organizacaoId: number
): Promise<
  (GraduacaoRow & {
    categoria: string;
  })[]
> {
  logger.debug("[graduacoesRepository] listarTodas", { organizacaoId });

  const [rows] = await db.execute<any[]>(
    `
      SELECT 
        g.id,
        g.nome,
        g.ordem,
        g.categoria_id,
        c.nome AS categoria
      FROM graduacoes g
      JOIN categorias c 
        ON c.id = g.categoria_id
       AND c.organizacao_id = ?
      WHERE g.organizacao_id = ?
      ORDER BY g.categoria_id, g.ordem ASC
    `,
    [organizacaoId, organizacaoId]
  );

  return rows;
}

/* ========================================================================== */
/* ➕ Criar                                                                    */
/* ========================================================================== */
async function criar({
  nome,
  ordem,
  categoriaId,
  organizacaoId,
}: CriarGraduacaoDTO): Promise<number> {
  logger.info("[graduacoesRepository] criar", {
    nome,
    ordem,
    categoriaId,
    organizacaoId,
  });

  const [result]: any = await db.execute(
    `
    INSERT INTO graduacoes (nome, ordem, categoria_id, organizacao_id)
    VALUES (?, ?, ?, ?)
    `,
    [nome, ordem, categoriaId, organizacaoId]
  );

  return result.insertId;
}

/* ========================================================================== */
/* ✏️ Atualizar                                                                */
/* ========================================================================== */
async function atualizar(
  id: number,
  { nome, ordem, organizacaoId }: AtualizarGraduacaoDTO
): Promise<boolean> {
  logger.info("[graduacoesRepository] atualizar", {
    id,
    nome,
    ordem,
    organizacaoId,
  });

  const [result]: any = await db.execute(
    `
      UPDATE graduacoes
         SET nome = ?, ordem = ?
       WHERE id = ?
         AND organizacao_id = ?
    `,
    [nome, ordem, id, organizacaoId]
  );

  return result.affectedRows > 0;
}

/* ========================================================================== */
/* ❌ Remover                                                                   */
/* ========================================================================== */
async function remover(
  id: number,
  organizacaoId: number
): Promise<boolean> {
  logger.warn("[graduacoesRepository] remover", { id, organizacaoId });

  const [result]: any = await db.execute(
    `
      DELETE FROM graduacoes 
      WHERE id = ? 
        AND organizacao_id = ?
    `,
    [id, organizacaoId]
  );

  return result.affectedRows > 0;
}

/* ========================================================================== */
/* 🔎 Buscar por ID                                                            */
/* ========================================================================== */
async function buscarPorId(
  id: number,
  organizacaoId: number
): Promise<GraduacaoRow | null> {
  logger.debug("[graduacoesRepository] buscarPorId", { id, organizacaoId });

  const [rows] = await db.execute<GraduacaoRow[]>(
    `
      SELECT id, nome, ordem, categoria_id, organizacao_id
        FROM graduacoes
       WHERE id = ?
         AND organizacao_id = ?
    `,
    [id, organizacaoId]
  );

  return rows[0] || null;
}

/* ========================================================================== */

export default {
  listarPorCategoria,
  listarTodas,
  criar,
  atualizar,
  remover,
  buscarPorId,
};

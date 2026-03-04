import db from "../../../database/connection";
import logger from "../../../utils/logger";

/**
 * Tipagem da tabela `organizacoes`
 */
export interface Organizacao {
  id: number;
  nome: string;
  slug: string;
  grupo_id: number | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // garantir compatibilidade futura
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar ID da organização pelo slug público                              */
/* -------------------------------------------------------------------------- */
export async function buscarIdPorSlug(slug: string): Promise<number | null> {
  try {
    if (!slug) throw new Error("Slug não informado.");

    const [rows] = await db.execute<{ id: number }[]>(
      "SELECT id FROM organizacoes WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (!rows.length) {
      logger.warn(`[organizacaoRepository] Slug não encontrado: ${slug}`);
      return null;
    }

    logger.debug(
      `[organizacaoRepository] Slug "${slug}" resolvido → org ${rows[0].id}`
    );

    return rows[0].id;
  } catch (err: any) {
    logger.error(
      "[organizacaoRepository] Erro ao buscar ID da organização por slug:",
      err.message
    );
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar informações completas da organização (nome, grupo, etc.)         */
/* -------------------------------------------------------------------------- */
export async function buscarPorSlug(
  slug: string
): Promise<Organizacao | null> {
  try {
    if (!slug) throw new Error("Slug não informado.");

    const [rows] = await db.execute<Organizacao[]>(
      "SELECT * FROM organizacoes WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (!rows.length) {
      logger.warn(
        `[organizacaoRepository] Organização não encontrada para slug "${slug}"`
      );
      return null;
    }

    logger.debug(
      `[organizacaoRepository] Organização encontrada via slug "${slug}"`
    );
    return rows[0];
  } catch (err: any) {
    logger.error(
      "[organizacaoRepository] Erro ao buscar organização por slug:",
      err.message
    );
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar organização completa por ID (uso interno)                        */
/* -------------------------------------------------------------------------- */
export async function buscarPorId(id: number): Promise<Organizacao | null> {
  try {
    const [rows] = await db.execute<Organizacao[]>(
      "SELECT * FROM organizacoes WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      logger.warn(
        `[organizacaoRepository] Organização não encontrada para ID ${id}`
      );
      return null;
    }

    logger.debug(`[organizacaoRepository] Organização encontrada (ID ${id})`);
    return rows[0];
  } catch (err: any) {
    logger.error(
      "[organizacaoRepository] Erro ao buscar organização por ID:",
      err.message
    );
    throw err;
  }
}
/* -------------------------------------------------------------------------- */
/* 🔹 Buscar configuração da organização                                      */
/* -------------------------------------------------------------------------- */
export async function buscarConfiguracao(
  organizacaoId: number,
  chave: string
): Promise<any | null> {
  try {
    const [rows] = await db.execute<any[]>(
      `
      SELECT valor
      FROM organizacoes_configuracoes
      WHERE organizacao_id = ?
      AND chave = ?
      LIMIT 1
      `,
      [organizacaoId, chave]
    );

    if (!rows.length) {
      logger.debug(
        `[organizacaoRepository] Configuração "${chave}" não encontrada para org ${organizacaoId}`
      );
      return null;
    }

    try {
      return JSON.parse(rows[0].valor);
    } catch {
      return rows[0].valor;
    }
  } catch (err: any) {
    logger.error(
      "[organizacaoRepository] Erro ao buscar configuração:",
      err.message
    );
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Upsert de configuração da organização                                   */
/* -------------------------------------------------------------------------- */
export async function salvarConfiguracao(
  organizacaoId: number,
  chave: string,
  valor: string
): Promise<void> {
  await db.execute(
    `
      INSERT INTO organizacoes_configuracoes (organizacao_id, chave, valor)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        valor = VALUES(valor),
        atualizado_em = CURRENT_TIMESTAMP
    `,
    [organizacaoId, chave, valor]
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 Remove configuração específica da organização                           */
/* -------------------------------------------------------------------------- */
export async function removerConfiguracao(
  organizacaoId: number,
  chave: string
): Promise<void> {
  await db.execute(
    `
      DELETE FROM organizacoes_configuracoes
      WHERE organizacao_id = ?
        AND chave = ?
    `,
    [organizacaoId, chave]
  );
}

/* -------------------------------------------------------------------------- */
/* 🔹 Atualiza telefone principal da organização                              */
/* -------------------------------------------------------------------------- */
export async function atualizarTelefoneOrganizacao(
  organizacaoId: number,
  telefone: string
): Promise<void> {
  await db.execute(
    `
      UPDATE organizacoes
      SET telefone = ?
      WHERE id = ?
    `,
    [telefone, organizacaoId]
  );
}

type AtualizarContatoOrganizacaoPayload = {
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  pais: string;
};

/* -------------------------------------------------------------------------- */
/* 🔹 Atualiza dados de contato públicos da organização                       */
/* -------------------------------------------------------------------------- */
export async function atualizarContatoPublicoOrganizacao(
  organizacaoId: number,
  payload: AtualizarContatoOrganizacaoPayload
): Promise<void> {
  await db.execute(
    `
      UPDATE organizacoes
      SET
        telefone = ?,
        email = ?,
        endereco = ?,
        cidade = ?,
        estado = ?,
        pais = ?
      WHERE id = ?
    `,
    [
      payload.telefone,
      payload.email,
      payload.endereco,
      payload.cidade,
      payload.estado,
      payload.pais,
      organizacaoId
    ]
  );
}

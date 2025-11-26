import {
  buscarIdPorSlug as repoBuscarIdPorSlug,
  buscarPorSlug as repoBuscarPorSlug,
  buscarPorId as repoBuscarPorId,
  Organizacao,
} from "./organizacaoRepository";
import logger from "../../../utils/logger";

/* -------------------------------------------------------------------------- */
/* 🔹 Resolver ID da organização a partir do slug                             */
/* -------------------------------------------------------------------------- */
export async function resolverIdPorSlug(slug: string): Promise<number> {
  try {
    if (!slug) throw new Error("Slug da organização não informado.");

    const id = await repoBuscarIdPorSlug(slug);

    if (!id) {
      throw new Error(`Organização não encontrada para o slug "${slug}"`);
    }

    logger.debug(
      `[organizacaoService] Slug "${slug}" resolvido para org ${id}`
    );

    return id;
  } catch (err: any) {
    logger.error(
      "[organizacaoService] Erro ao resolver ID por slug:",
      err.message
    );
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar informações completas da organização                             */
/* -------------------------------------------------------------------------- */
export async function buscarPorSlug(slug: string): Promise<Organizacao> {
  try {
    const organizacao = await repoBuscarPorSlug(slug);

    if (!organizacao) {
      throw new Error(`Organização não encontrada para o slug "${slug}"`);
    }

    logger.debug(`[organizacaoService] Organização carregada (slug: ${slug})`);

    return organizacao;
  } catch (err: any) {
    logger.error(
      "[organizacaoService] Erro ao buscar organização:",
      err.message
    );
    throw err;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar organização por ID (uso interno)                                 */
/* -------------------------------------------------------------------------- */
export async function buscarPorId(id: number): Promise<Organizacao> {
  try {
    const organizacao = await repoBuscarPorId(id);

    if (!organizacao) {
      throw new Error(`Organização não encontrada para o ID ${id}`);
    }

    return organizacao;
  } catch (err: any) {
    logger.error(
      "[organizacaoService] Erro ao buscar organização por ID:",
      err.message
    );
    throw err;
  }
}

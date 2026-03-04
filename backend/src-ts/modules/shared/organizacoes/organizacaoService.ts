import {
  buscarIdPorSlug as repoBuscarIdPorSlug,
  buscarPorSlug as repoBuscarPorSlug,
  buscarPorId as repoBuscarPorId,
  buscarConfiguracao as repoBuscarConfiguracao,
  salvarConfiguracao as repoSalvarConfiguracao,
  removerConfiguracao as repoRemoverConfiguracao,
  atualizarTelefoneOrganizacao as repoAtualizarTelefoneOrganizacao,
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
/* 🔹 Buscar URL pública do site por slug (configuração multi-org)            */
/* -------------------------------------------------------------------------- */
export async function buscarSiteUrlPorSlug(slug: string): Promise<string | null> {
  const organizacao = await buscarPorSlug(slug);

  const valor = await repoBuscarConfiguracao(organizacao.id, "site_url");

  if (typeof valor !== "string") {
    logger.debug(
      `[organizacaoService] site_url ausente para org ${organizacao.id} (slug: ${slug})`
    );
    return null;
  }

  const siteUrl = valor.trim();
  if (!siteUrl) return null;

  return siteUrl;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Resolver WhatsApp público por slug (config -> fallback telefone)        */
/* -------------------------------------------------------------------------- */
export async function buscarWhatsappContatoPorSlug(slug: string): Promise<string | null> {
  const organizacao = await buscarPorSlug(slug);

  const valorConfig = await repoBuscarConfiguracao(organizacao.id, "whatsapp_contato");
  if (typeof valorConfig === "string" && valorConfig.trim()) {
    return valorConfig.trim();
  }

  if (typeof organizacao.telefone === "string" && organizacao.telefone.trim()) {
    return organizacao.telefone.trim();
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar contato admin por organização                                     */
/* -------------------------------------------------------------------------- */
export async function buscarContatoAdminPorOrganizacaoId(organizacaoId: number) {
  const organizacao = await buscarPorId(organizacaoId);
  const valorConfig = await repoBuscarConfiguracao(organizacaoId, "whatsapp_contato");

  const whatsappConfig = typeof valorConfig === "string" ? valorConfig.trim() : null;
  const telefone = typeof organizacao.telefone === "string" ? organizacao.telefone.trim() : "";
  const whatsappContato = whatsappConfig || telefone;

  return {
    telefone,
    whatsapp_contato: whatsappContato,
    origem: whatsappConfig ? "configuracao" : "organizacao"
  };
}

/* -------------------------------------------------------------------------- */
/* 🔹 Atualizar contato admin por organização                                  */
/* -------------------------------------------------------------------------- */
export async function atualizarContatoAdminPorOrganizacaoId(
  organizacaoId: number,
  contato: string
) {
  const valorLimpo = contato.trim();

  await repoAtualizarTelefoneOrganizacao(organizacaoId, valorLimpo);

  // Mantemos sincronizado na configuração para consumidores que já usam essa chave.
  if (valorLimpo) {
    await repoSalvarConfiguracao(organizacaoId, "whatsapp_contato", valorLimpo);
  } else {
    await repoRemoverConfiguracao(organizacaoId, "whatsapp_contato");
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

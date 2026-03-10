import {
  buscarIdPorSlug as repoBuscarIdPorSlug,
  buscarPorSlug as repoBuscarPorSlug,
  buscarPorId as repoBuscarPorId,
  buscarConfiguracao as repoBuscarConfiguracao,
  salvarConfiguracao as repoSalvarConfiguracao,
  removerConfiguracao as repoRemoverConfiguracao,
  atualizarContatoPublicoOrganizacao as repoAtualizarContatoPublicoOrganizacao,
  Organizacao,
} from "./organizacaoRepository";
import logger from "../../../utils/logger";
import crypto from "crypto";

const MP_CONFIG_KEYS = {
  active: "mp_ativo",
  mode: "mp_ambiente",
  publicKey: "mp_public_key",
  accessTokenEncrypted: "mp_access_token_enc",
} as const;

function getCryptoSecret(): string {
  const secret =
    process.env.ORG_CONFIG_CRYPTO_KEY ||
    process.env.CONFIG_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    "";

  if (!secret) {
    throw new Error(
      "Chave de criptografia nao configurada (ORG_CONFIG_CRYPTO_KEY/CONFIG_ENCRYPTION_KEY/JWT_SECRET)"
    );
  }

  return secret;
}

function deriveKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptText(plainText: string): string {
  const key = deriveKey(getCryptoSecret());
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptText(payload: string): string {
  const [version, ivB64, tagB64, dataB64] = String(payload || "").split(":");
  if (version !== "v1" || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Formato de token criptografado invalido");
  }

  const key = deriveKey(getCryptoSecret());
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8"
  );
}

function parseBooleanConfig(value: any, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "sim", "yes"].includes(normalized)) return true;
    if (["0", "false", "nao", "não", "no"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value === 1;
  return fallback;
}

function parseModeConfig(value: any): "sandbox" | "producao" {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "sandbox" ? "sandbox" : "producao";
}

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
  const email = typeof organizacao.email === "string" ? organizacao.email.trim() : "";
  const endereco = typeof organizacao.endereco === "string" ? organizacao.endereco.trim() : "";
  const cidade = typeof organizacao.cidade === "string" ? organizacao.cidade.trim() : "";
  const estado = typeof organizacao.estado === "string" ? organizacao.estado.trim() : "";
  const pais = typeof organizacao.pais === "string" ? organizacao.pais.trim() : "";

  return {
    telefone,
    email,
    endereco,
    cidade,
    estado,
    pais,
    whatsapp_contato: whatsappContato,
    origem: whatsappConfig ? "configuracao" : "organizacao"
  };
}

/* -------------------------------------------------------------------------- */
/* 🔹 Atualizar contato admin por organização                                  */
/* -------------------------------------------------------------------------- */
export async function atualizarContatoAdminPorOrganizacaoId(
  organizacaoId: number,
  payload: {
    telefone: string;
    whatsapp_contato: string;
    email: string;
    endereco: string;
    cidade?: string;
    estado?: string;
    pais?: string;
  }
) {
  const telefone = payload.telefone.trim();
  const whatsappContato = payload.whatsapp_contato.trim() || telefone;
  const email = payload.email.trim();
  const endereco = payload.endereco.trim();
  const cidade = payload.cidade?.trim() || "";
  const estado = payload.estado?.trim() || "";
  const pais = payload.pais?.trim() || "Brasil";

  await repoAtualizarContatoPublicoOrganizacao(organizacaoId, {
    telefone,
    email,
    endereco,
    cidade,
    estado,
    pais
  });

  // Mantemos sincronizado na configuração para consumidores que já usam essa chave.
  if (whatsappContato) {
    await repoSalvarConfiguracao(organizacaoId, "whatsapp_contato", whatsappContato);
  } else {
    await repoRemoverConfiguracao(organizacaoId, "whatsapp_contato");
  }
}

export async function buscarMercadoPagoAdminPorOrganizacaoId(
  organizacaoId: number
) {
  const [ativoRaw, modeRaw, publicKeyRaw, tokenEncRaw] = await Promise.all([
    repoBuscarConfiguracao(organizacaoId, MP_CONFIG_KEYS.active),
    repoBuscarConfiguracao(organizacaoId, MP_CONFIG_KEYS.mode),
    repoBuscarConfiguracao(organizacaoId, MP_CONFIG_KEYS.publicKey),
    repoBuscarConfiguracao(organizacaoId, MP_CONFIG_KEYS.accessTokenEncrypted),
  ]);

  return {
    ativo: parseBooleanConfig(ativoRaw, true),
    ambiente: parseModeConfig(modeRaw),
    public_key: String(publicKeyRaw || ""),
    access_token_configurado: Boolean(tokenEncRaw),
  };
}

export async function atualizarMercadoPagoAdminPorOrganizacaoId(
  organizacaoId: number,
  payload: {
    ativo: boolean;
    ambiente: "sandbox" | "producao";
    public_key: string;
    access_token?: string;
    remover_access_token?: boolean;
  }
) {
  await repoSalvarConfiguracao(
    organizacaoId,
    MP_CONFIG_KEYS.active,
    payload.ativo ? "1" : "0"
  );
  await repoSalvarConfiguracao(
    organizacaoId,
    MP_CONFIG_KEYS.mode,
    payload.ambiente
  );
  await repoSalvarConfiguracao(
    organizacaoId,
    MP_CONFIG_KEYS.publicKey,
    payload.public_key
  );

  if (payload.remover_access_token) {
    await repoRemoverConfiguracao(organizacaoId, MP_CONFIG_KEYS.accessTokenEncrypted);
    return;
  }

  if (payload.access_token && payload.access_token.trim()) {
    await repoSalvarConfiguracao(
      organizacaoId,
      MP_CONFIG_KEYS.accessTokenEncrypted,
      encryptText(payload.access_token.trim())
    );
  }
}

export async function buscarMercadoPagoPublicoPorSlug(slug: string) {
  const organizacao = await buscarPorSlug(slug);
  const [ativoRaw, modeRaw, publicKeyRaw] = await Promise.all([
    repoBuscarConfiguracao(organizacao.id, MP_CONFIG_KEYS.active),
    repoBuscarConfiguracao(organizacao.id, MP_CONFIG_KEYS.mode),
    repoBuscarConfiguracao(organizacao.id, MP_CONFIG_KEYS.publicKey),
  ]);

  const publicKeyConfig = String(publicKeyRaw || "").trim();
  const fallbackPublicKey = String(
    process.env.MERCADO_PAGO_PUBLIC_KEY ||
      process.env.VITE_MP_PUBLIC_KEY ||
      ""
  ).trim();

  return {
    organizacao_id: organizacao.id,
    ativo: parseBooleanConfig(ativoRaw, true),
    ambiente: parseModeConfig(modeRaw),
    public_key: publicKeyConfig || fallbackPublicKey || null,
    source: publicKeyConfig ? "configuracao" : "env",
  };
}

export async function resolverCredenciaisMercadoPagoPorOrganizacaoId(
  organizacaoId: number
) {
  const [ativoRaw, modeRaw, publicKeyRaw, tokenEncRaw] = await Promise.all([
    repoBuscarConfiguracao(organizacaoId, MP_CONFIG_KEYS.active),
    repoBuscarConfiguracao(organizacaoId, MP_CONFIG_KEYS.mode),
    repoBuscarConfiguracao(organizacaoId, MP_CONFIG_KEYS.publicKey),
    repoBuscarConfiguracao(organizacaoId, MP_CONFIG_KEYS.accessTokenEncrypted),
  ]);

  let tokenConfig = "";
  if (tokenEncRaw) {
    try {
      tokenConfig = decryptText(String(tokenEncRaw));
    } catch (error: any) {
      logger.error(
        "[organizacaoService] Erro ao descriptografar token Mercado Pago",
        { organizacaoId, erro: error?.message }
      );
      throw new Error(
        "Token Mercado Pago da organizacao esta invalido. Atualize nas configuracoes."
      );
    }
  }

  const fallbackAccessToken = String(process.env.MERCADO_PAGO_ACCESS_TOKEN || "").trim();
  const fallbackPublicKey = String(
    process.env.MERCADO_PAGO_PUBLIC_KEY ||
      process.env.VITE_MP_PUBLIC_KEY ||
      ""
  ).trim();
  const accessToken = tokenConfig || fallbackAccessToken;
  const publicKey = String(publicKeyRaw || "").trim() || fallbackPublicKey;

  if (!accessToken) {
    throw new Error("Mercado Pago sem access token configurado para esta organizacao.");
  }

  return {
    ativo: parseBooleanConfig(ativoRaw, true),
    ambiente: parseModeConfig(modeRaw),
    accessToken,
    publicKey: publicKey || null,
    source: tokenConfig ? "configuracao" : "env",
  };
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

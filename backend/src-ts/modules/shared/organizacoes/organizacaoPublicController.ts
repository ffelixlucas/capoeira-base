import { Request, Response } from "express";
import {
  buscarPorSlug,
  buscarSiteUrlPorSlug,
  buscarWhatsappContatoPorSlug
} from "./organizacaoService";
import logger from "../../../utils/logger";

/**
 * 🔹 Retorna dados públicos da organização via slug
 */
export async function getOrganizacaoPublica(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ error: "Slug não informado" });
    }

    const org = await buscarPorSlug(slug);

    if (!org) {
      return res.status(404).json({ error: "Organização não encontrada" });
    }

    const siteUrl = await buscarSiteUrlPorSlug(slug);
    const whatsappContato = await buscarWhatsappContatoPorSlug(slug);

    logger.debug(
      `[organizacaoPublicController] Organização pública encontrada: ${org.nome_fantasia} (org ${org.id})`
    );

    return res.json({
      organizacao_id: org.id,
      nome: org.nome,
      nome_fantasia: org.nome_fantasia,
      grupo: org.grupo,
      cidade: org.cidade,
      estado: org.estado,
      pais: org.pais,
      slug: org.slug,
      site_url: siteUrl,
      whatsapp_contato: whatsappContato,
    });
  } catch (err: any) {
    logger.error(
      "[organizacaoPublicController] Erro ao buscar organização pública:",
      err.message
    );
    return res.status(500).json({ error: "Erro ao buscar organização" });
  }
}

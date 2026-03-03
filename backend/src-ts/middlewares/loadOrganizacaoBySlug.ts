import { Request, Response, NextFunction } from "express";
import db from "../database/connection";
import logger from "../utils/logger";

export default async function loadOrganizacaoBySlug(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Slug não informado." });
    }

    const [rows]: any = await db.query(
      "SELECT id, nome FROM organizacoes WHERE slug = ?",
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Organização não encontrada." });
    }

    const organizacao = rows[0];

    logger.debug("[loadOrganizacaoBySlug] Organização carregada", {
      slug,
      organizacao_id: organizacao.id,
    });

    req.organizacaoPublica = organizacao;

    next();
  } catch (error: any) {
    logger.error("[loadOrganizacaoBySlug] Erro", { error: error.message });
    return res.status(500).json({ message: "Erro interno." });
  }
}
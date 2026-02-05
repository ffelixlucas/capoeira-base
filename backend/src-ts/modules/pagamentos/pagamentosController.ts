import { Request, Response } from "express";
import logger from "../../utils/logger";
import { criarCobrancaService } from "./pagamentosService";
import { buscarOrganizacaoPorSlug } from "./pagamentosRepository";


export async function criarCobranca(req: Request, res: Response) {
  try {
    const { slug } = req.params;

    const org = await buscarOrganizacaoPorSlug(slug);

    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organização não encontrada para o slug informado",
      });
    }

    const resultado = await criarCobrancaService({
      ...req.body,
      organizacao_id: org.id,
    });

    return res.json({
      success: true,
      data: resultado,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Erro ao criar cobrança",
    });
  }
}
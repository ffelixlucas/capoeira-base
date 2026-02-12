import { Request, Response } from "express";
import logger from "../../../utils/logger";
import { finalizarPedidoPublicService } from "./pedidosPublicService";

export async function finalizarPedidoPublic(req: Request | any, res: Response) {
  try {
    logger.debug("[pedidosPublic] inicio finalizarPedidoPublic", {
      body: req.body,
      params: req.params,
      path: req.path,
    });

    const { cpf, nome, telefone, email, itens, slug } = req.body;

    if (!slug) {
      logger.warn("[pedidosPublic] slug nao informado");
      return res.status(400).json({
        success: false,
        message: "Slug não informado",
      });
    }

if (!cpf || !nome || !telefone || !email || !Array.isArray(itens)) {
      return res.status(400).json({
        success: false,
        message: "Payload inválido",
      });
    }

    const pedido = await finalizarPedidoPublicService({
      slug,
      cpf,
      nome,
      telefone,
      itens,
      email,
      
    });

    return res.json({
      success: true,
      pedido_id: pedido.id,
      valor_total: pedido.valor_total,
    });
  } catch (error: any) {
    logger.error("[pedidosPublic] erro finalizarPedidoPublic", {
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Erro interno",
    });
  }
}

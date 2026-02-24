import { Request, Response } from "express";
import logger from "../../utils/logger";
import { registrarEntradaManual } from "./estoqueService";

async function entradaManual(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;

    const { sku_id, quantidade, motivo } = req.body;

    if (!sku_id || !quantidade || !motivo) {
      return res.status(400).json({
        success: false,
        message: "sku_id, quantidade e motivo são obrigatórios",
      });
    }

    await registrarEntradaManual({
      organizacaoId,
      skuId: Number(sku_id),
      quantidade: Number(quantidade),
      motivo,
    });

    return res.json({
      success: true,
      message: "Entrada manual registrada com sucesso",
    });

  } catch (error: any) {
    logger.error("[estoqueController] Erro na entrada manual", {
      error,
    });

    return res.status(500).json({
      success: false,
      message: error.message || "Erro interno",
    });
  }
}

export {
  entradaManual,
};
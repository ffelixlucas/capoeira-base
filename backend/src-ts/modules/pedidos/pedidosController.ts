import { Request, Response } from "express";
import logger from "../../utils/logger";
import { buscarPedidoPorId } from "./pedidosService";

export async function buscarPedido(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const { pedidoId } = req.params;

    const pedido = await buscarPedidoPorId(
      organizacaoId,
      Number(pedidoId)
    );

    return res.json({
      success: true,
      data: pedido,
    });
  } catch (error: any) {
    logger.warn("[pedidosController] erro ao buscar pedido", {
      error: error.message,
    });

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

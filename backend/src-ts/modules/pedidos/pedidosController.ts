import { Request, Response } from "express";
import logger from "../../utils/logger";
import { buscarPedidoPorId } from "./pedidosService";

export async function buscarPedido(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const { pedidoId } = req.params;

    const pedidoIdNum = Number(pedidoId);
    if (isNaN(pedidoIdNum)) {
      return res.status(400).json({
        success: false,
        message: "pedidoId inválido",
      });
    }

    const pedido = await buscarPedidoPorId(
      organizacaoId,
      pedidoIdNum
    );

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: "Pedido não encontrado",
      });
    }

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

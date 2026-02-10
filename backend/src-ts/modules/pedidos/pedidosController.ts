import { Request, Response } from "express";
import logger from "../../utils/logger";
import { buscarPedidoPorId } from "./pedidosService";
import { marcarPedidoProntoRetirada } from "./pedidosRepository";
import { dispararEventoEmail } from "../notificacoes/notificacoesEventosService";

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



export async function marcarPedidoPronto(req: Request, res: Response) {
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

    await marcarPedidoProntoRetirada(organizacaoId, pedidoIdNum);

    await dispararEventoEmail({
      organizacaoId,
      tipo: "loja",
      subject: "Pedido pronto para retirada",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
          <p><strong>Seu pedido está pronto para retirada</strong> ✅</p>
          <p>Você já pode buscar seu pedido na academia.</p>
          <p><strong>Horários:</strong> X até Y</p>
          <p><strong>Dias:</strong> X e Y</p>
          <p>Em caso de dúvidas, fale com a equipe.</p>
        </div>
      `,
    });

    return res.json({ success: true });
  } catch (error: any) {
    logger.warn("[pedidosController] erro ao marcar pedido pronto", {
      error: error.message,
    });

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


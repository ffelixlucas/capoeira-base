import { Request, Response } from "express";
import logger from "../../utils/logger";
import {
  buscarPedidoPorId,
  listarPedidosPorOrg,
  cancelarPedidoPorId,
  obterEstatisticasPedidos,
  marcarPedidoEntregue as marcarPedidoEntregueService,
  estornarPedidoService } from "./pedidosService";
import { marcarPedidoProntoRetirada } from "./pedidosRepository";
import { dispararEventoEmail } from "../notificacoes/notificacoesEventosService";
import emailService from "../../services/emailService";
import { buscarConfiguracao } from "../shared/organizacoes/organizacaoRepository";



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

    if (pedido.status !== "convertido") {
      return res.status(400).json({
        success: false,
        message: "Pedido ainda não foi pago",
      });
    }

    if (pedido.status_operacional === "pronto_retirada") {
      return res.status(400).json({
        success: false,
        message: "Pedido já está marcado como pronto",
      });
    }

    await marcarPedidoProntoRetirada(organizacaoId, pedidoIdNum);

    const agendaRetirada = await buscarConfiguracao(
      organizacaoId,
      "retirada_agenda"
    );

    const enderecoRetirada = await buscarConfiguracao(
      organizacaoId,
      "retirada_endereco"
    );
    
    const whatsappContato = await buscarConfiguracao(
      organizacaoId,
      "whatsapp_contato"
    );
    
    console.log("Endereço retirada:", enderecoRetirada);
    console.log("WhatsApp contato:", whatsappContato);
    
    let agendaTexto: string | undefined;

    if (agendaRetirada) {
      const agenda = agendaRetirada;

      const nomesDias: Record<string, string> = {
        segunda: "Segunda-feira",
        terca: "Terça-feira",
        quarta: "Quarta-feira",
        quinta: "Quinta-feira",
        sexta: "Sexta-feira",
        sabado: "Sábado",
        domingo: "Domingo",
      };
      
      agendaTexto = Object.entries(agenda)
        .map(([dia, horario]: any) => {
          const nomeDia = nomesDias[dia] || dia;
          return `
            <div style="margin-bottom:8px;">
              <strong>${nomeDia}</strong> — ${horario.inicio} às ${horario.fim}
            </div>
          `;
        })
        .join("");
      
    }



    console.log("Agenda objeto:", agendaRetirada?.valor);
    console.log("Agenda texto final:", agendaTexto);

    const pedidoAtualizado = await buscarPedidoPorId(
      organizacaoId,
      pedidoIdNum
    );

    await emailService.enviarEmailPedidoProntoRetirada({
      pedido: pedidoAtualizado,
      agendaTexto,
      enderecoRetirada,
      whatsappContato
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

export async function listarPedidos(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;

    const {
      status_financeiro,
      status_operacional,
      data_inicio,
      data_fim,
      cursor_criado_em,
      cursor_id,
      limit,
    } = req.query;

    const cursor =
      cursor_criado_em && cursor_id
        ? {
            criado_em: cursor_criado_em as string,
            id: Number(cursor_id),
          }
        : undefined;

    const limite = limit ? Number(limit) : 20;

    const resultado = await listarPedidosPorOrg(
      organizacaoId,
      {
        status_financeiro: status_financeiro as string | undefined,
        status_operacional: status_operacional as string | undefined,
        data_inicio: data_inicio as string | undefined,
        data_fim: data_fim as string | undefined,
      },
      cursor,
      limite
    );

    return res.json({
      success: true,
      data: resultado.dados,
      next_cursor: resultado.next_cursor,
    });
  } catch (error: any) {
    logger.warn("[pedidosController] erro ao listar pedidos", {
      error: error.message,
    });

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
export async function cancelarPedido(req: Request, res: Response) {
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

    if (pedido.status === "cancelado") {
      return res.status(400).json({
        success: false,
        message: "Pedido já está cancelado",
      });
    }

    if (pedido.status_operacional === "pronto_retirada") {
      return res.status(400).json({
        success: false,
        message: "Pedido já está pronto para retirada e não pode ser cancelado",
      });
    }


    const affectedRows = await cancelarPedidoPorId(
      organizacaoId,
      pedidoIdNum
    );

    if (affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Não foi possível cancelar o pedido",
      });
    }

    return res.json({
      success: true,
      message: "Pedido cancelado com sucesso",
    });

  } catch (error: any) {
    logger.warn("[pedidosController] erro ao cancelar pedido", {
      error: error.message,
    });

    return res.status(400).json({
      success: false,
      message: error.message,
    });


  }
}
export async function estatisticasPedidos(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;

    const dados = await obterEstatisticasPedidos(organizacaoId);

    return res.json({
      success: true,
      data: {
        total_pedidos: Number(dados.total_pedidos) || 0,
        total_faturado: Number(dados.total_faturado) || 0,
        pendentes: Number(dados.pendentes) || 0,
        estornados: Number(dados.estornados) || 0,
        cancelados: Number(dados.cancelados) || 0,
        em_separacao: Number(dados.em_separacao) || 0,
        pronto_retirada: Number(dados.pronto_retirada) || 0,
        entregues: Number(dados.entregues) || 0,
      },
    });
  } catch (error: any) {
    logger.warn("[pedidosController] erro ao buscar estatísticas", {
      error: error.message,
    });

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function marcarPedidoEntregue(req: Request, res: Response) {
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

    await marcarPedidoEntregueService(
      pedidoIdNum,
      organizacaoId
    );

    return res.json({
      success: true,
      message: "Pedido marcado como entregue",
    });
  } catch (error: any) {
    logger.warn("[pedidosController] erro ao marcar entregue", {
      error: error.message,
    });

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function estornarPedido(req: any, res: any) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const pedidoId = Number(req.params.pedidoId);

    if (!pedidoId) {
      return res.status(400).json({ error: "pedidoId inválido" });
    }

    await estornarPedidoService(organizacaoId, pedidoId);

    return res.json({ success: true });
  } catch (error: any) {

    logger.error("[pedidosController] erro ao estornar", {
      message: error.message,
      stack: error.stack
    });

    return res.status(400).json({
      error: error.message || "Erro ao estornar pedido",
    });
  }
}
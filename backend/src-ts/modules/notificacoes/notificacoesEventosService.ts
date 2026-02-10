// backend/src-ts/modules/notificacoes/notificacoesEventosService.ts

import logger from "../../utils/logger";
import { listarPorTipo } from "../notificacaoDestinos/notificacaoDestinosRepository";
import emailService from "../../services/emailService";

type EventoEmailParams = {
  organizacaoId: number;
  tipo: "loja" | "loja_cliente" | "matricula" | "evento" | "pagamento";
  subject: string;
  html: string;
};

export async function dispararEventoEmail({
  organizacaoId,
  tipo,
  subject,
  html,
}: EventoEmailParams) {
  logger.info("[notificacoesEventos] Disparo iniciado", {
    organizacaoId,
    tipo,
  });

const destinos = await listarPorTipo(organizacaoId, tipo);

  if (!destinos || destinos.length === 0) {
    logger.warn("[notificacoesEventos] Nenhum destino configurado", {
      organizacaoId,
      tipo,
    });
    return;
  }

  for (const destino of destinos) {
    await emailService.enviarEmailCustom({
      to: destino.email,
      subject,
      html,
    });
  }

  logger.info("[notificacoesEventos] Disparo finalizado", {
    organizacaoId,
    tipo,
    total: destinos.length,
  });
}

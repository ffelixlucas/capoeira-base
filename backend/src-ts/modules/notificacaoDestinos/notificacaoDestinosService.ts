import {
  listarPorTipo,
  criar,
  remover,
  NotificacaoDestino,
} from "./notificacaoDestinosRepository";
import logger from "../../utils/logger";

/**
 * Lista e-mails de notificação por tipo (multi-organização)
 */
export async function listar(
  organizacaoId: number,
  tipo: string
): Promise<Pick<NotificacaoDestino, "id" | "email">[]> {
  logger.debug(
    `[notificacaoDestinosService] org ${organizacaoId} - listando notificações tipo ${tipo}`
  );

  return listarPorTipo(organizacaoId, tipo);
}

/**
 * Adiciona nova notificação
 */
export async function adicionar(
  organizacaoId: number,
  tipo: string,
  email: string | { email: string }
): Promise<NotificacaoDestino> {

  const emailFinal =
    typeof email === "object" && email.email ? email.email : String(email);

  logger.info(
    `[notificacaoDestinosService] org ${organizacaoId} - adicionando e-mail ${emailFinal} (${tipo})`
  );

  return criar(organizacaoId, tipo, emailFinal);
}

/**
 * Remove e-mail de notificação
 */
export async function deletar(
  id: number,
  organizacaoId: number
): Promise<boolean> {
  logger.warn(
    `[notificacaoDestinosService] org ${organizacaoId} - removendo notificação id ${id}`
  );

  return remover(id, organizacaoId);
}

/**
 * Retorna apenas lista de e-mails (uso interno)
 */
export async function getEmails(
  organizacaoId: number,
  tipo: string = "matricula"
): Promise<string[]> {

  logger.debug(
    `[notificacaoDestinosService] org ${organizacaoId} - buscando e-mails tipo ${tipo}`
  );

  const rows = await listarPorTipo(organizacaoId, tipo);

  return rows.map((r) => r.email);
}

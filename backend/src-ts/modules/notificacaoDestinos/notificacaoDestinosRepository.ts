import db from "../../database/connection";
import logger from "../../utils/logger";

/**
 * Tipagem do registro de notificação
 */
export interface NotificacaoDestino {
  id: number;
  organizacao_id: number;
  tipo: string;
  email: string;
}

/**
 * Lista e-mails de notificação (multi-organização)
 */
export async function listarPorTipo(
  organizacaoId: number,
  tipo: string
): Promise<Pick<NotificacaoDestino, "id" | "email">[]> {
  logger.debug(
    `[notificacaoDestinosRepository] org ${organizacaoId} - listando tipo ${tipo}`
  );

  const [rows] = await db.execute<
    Pick<NotificacaoDestino, "id" | "email">[]
  >(
    `
    SELECT id, email 
    FROM notificacao_destinos 
    WHERE organizacao_id = ? AND tipo = ?
    ORDER BY id
    `,
    [organizacaoId, tipo]
  );

  return rows;
}

/**
 * Cria novo destino de notificação
 */
export async function criar(
  organizacaoId: number,
  tipo: string,
  email: string
): Promise<NotificacaoDestino> {
  const [result]: any = await db.execute(
    `
    INSERT INTO notificacao_destinos (organizacao_id, tipo, email)
    VALUES (?, ?, ?)
    `,
    [organizacaoId, tipo, email]
  );

  logger.info(
    `[notificacaoDestinosRepository] org ${organizacaoId} - novo destino criado (${email})`
  );

  return {
    id: result.insertId,
    organizacao_id: organizacaoId,
    tipo,
    email,
  };
}

/**
 * Remove e-mail de notificação
 */
export async function remover(
  id: number,
  organizacaoId: number
): Promise<boolean> {
  await db.execute(
    `DELETE FROM notificacao_destinos WHERE id = ? AND organizacao_id = ?`,
    [id, organizacaoId]
  );

  logger.warn(
    `[notificacaoDestinosRepository] org ${organizacaoId} - notificação removida id ${id}`
  );

  return true;
}

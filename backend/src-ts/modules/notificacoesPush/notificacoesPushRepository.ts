import db from "../../database/connection";
import logger from "../../utils/logger";

export interface PushSubscriptionData {
  usuario_id: number;
  organizacao_id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

const notificacoesPushRepository = {
  async salvarSubscription(data: PushSubscriptionData) {
    logger.debug("[notificacoesPushRepository] Salvando subscription", data);

    const sql = `
      INSERT INTO push_subscriptions 
        (usuario_id, organizacao_id, endpoint, p256dh, auth)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        endpoint = VALUES(endpoint),
        p256dh = VALUES(p256dh),
        auth = VALUES(auth)
    `;

    const params = [
      data.usuario_id,
      data.organizacao_id,
      data.endpoint,
      data.p256dh,
      data.auth,
    ];

    const [result] = await db.execute(sql, params);
    return result;
  },

  async listarPorOrganizacao(organizacao_id: number) {
    logger.debug("[notificacoesPushRepository] Listando subscriptions", {
      organizacao_id,
    });

    const sql = `
      SELECT *
      FROM push_subscriptions
      WHERE organizacao_id = ?
    `;

    const [rows] = await db.execute(sql, [organizacao_id]);
    return rows;
  },

  /** ******************************************************************
   * 🔹 Remover subscription inválida (410 / 404)
   ******************************************************************* */
  async remover(id: number) {
    logger.warn("[notificacoesPushRepository] Removendo subscription inválida", {
      id,
    });

    const sql = `
      DELETE FROM push_subscriptions
      WHERE id = ?
    `;

    await db.execute(sql, [id]);
  }
};

export default notificacoesPushRepository;

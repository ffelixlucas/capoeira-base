import logger from "../../utils/logger";
import webpush from "web-push";
import notificacoesPushRepository, {
  PushSubscriptionData,
} from "./notificacoesPushRepository";

// ------------------------------------------------------
// 🔹 Configuração do Web Push (usa variáveis do ENV)
// ------------------------------------------------------
webpush.setVapidDetails(
  "mailto:noreply@capoeirabase.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const notificacoesPushService = {
  /** ******************************************************************
   *  🔹 Salvar ou atualizar a subscription
   ******************************************************************* */
  async salvarSubscription(data: PushSubscriptionData) {
    logger.debug("[notificacoesPushService] Recebendo subscription", data);

    if (!data.usuario_id || !data.organizacao_id) {
      logger.warn("[notificacoesPushService] Dados incompletos", data);
      throw new Error("Dados de usuário ou organização inválidos.");
    }

    if (!data.endpoint || !data.p256dh || !data.auth) {
      logger.warn("[notificacoesPushService] Subscription incompleta", data);
      throw new Error("Subscription inválida.");
    }

    await notificacoesPushRepository.salvarSubscription(data);

    logger.debug("[notificacoesPushService] Subscription salva com sucesso", {
      usuario_id: data.usuario_id,
      organizacao_id: data.organizacao_id,
    });

    return { success: true };
  },

  /** ******************************************************************
   *  🔹 Listar todas as subscriptions da organização
   ******************************************************************* */
  async listarSubscriptions(organizacao_id: number) {
    logger.debug("[notificacoesPushService] Listando subscriptions", {
      organizacao_id,
    });

    return await notificacoesPushRepository.listarPorOrganizacao(
      organizacao_id
    );
  },

  /** ******************************************************************
   *  🔹 Enviar notificação para TODA a organização
   ******************************************************************* */
  async enviarNotificacaoParaOrganizacao(
    organizacao_id: number,
    title: string,
    body: string
  ) {
    logger.debug("[notificacoesPushService] Enviando notificação", {
      organizacao_id,
      title,
      body,
    });

    const subs = await notificacoesPushRepository.listarPorOrganizacao(
      organizacao_id
    );

    if (!subs.length) {
      logger.warn(
        "[notificacoesPushService] Nenhuma subscription encontrada para envio"
      );
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
    });

    for (const sub of subs) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);

        logger.debug("[notificacoesPushService] Notificação enviada para", {
          usuario_id: sub.usuario_id,
        });

      } catch (err: any) {
        logger.error("[notificacoesPushService] Erro ao enviar notificação", {
          message: err.message,
          endpoint: sub.endpoint,
        });

        // 🔥 Caso seja subscription inválida → remover do banco
        if (err.statusCode === 404 || err.statusCode === 410) {
          logger.warn(
            "[notificacoesPushService] Subscription expirada — removendo",
            { id: sub.id }
          );
          await notificacoesPushRepository.remover(sub.id);
        }
      }
    }
  },
};

export default notificacoesPushService;

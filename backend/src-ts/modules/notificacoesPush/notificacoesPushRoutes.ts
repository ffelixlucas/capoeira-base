// src-ts/modules/notificacoesPush/notificacoesPushRoutes.ts

import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import notificacoesPushController from "./notificacoesPushController";
import notificacoesPushService from "./notificacoesPushService";
import logger from "../../utils/logger";
import webpush from "web-push";

logger.debug("[notificacoesPushRoutes] Inicializando rotas de notificações push...");

const router = Router();

/**
 * 📌 POST /api/notificacoes-push/salvar
 * Salva ou atualiza a subscription do navegador do usuário.
 */
router.post(
  "/salvar",
  verifyToken,
  notificacoesPushController.salvarSubscription
);

/**
 * 📌 GET /api/notificacoes-push/
 * Lista todas as subscriptions da organização
 */
router.get(
  "/",
  verifyToken,
  notificacoesPushController.listarPorOrganizacao
);

/**
 * 📌 POST /api/notificacoes-push/testar
 * Envia uma notificação push para todas as subscriptions da organização.
 */
router.post(
  "/testar",
  verifyToken,
  async (req, res) => {
    try {
      const usuario = req.usuario;
      const organizacao_id = usuario.organizacao_id;

      const { titulo, mensagem } = req.body;

      logger.debug("[notificacoesPushRoutes] Testando envio de push", {
        organizacao_id,
        titulo,
        mensagem,
      });

      // 🔍 Buscar todas as subscriptions
      const subs = await notificacoesPushService.listarSubscriptions(organizacao_id);

      if (!subs || subs.length === 0) {
        return res.status(400).json({
          error: "Nenhuma subscription cadastrada para esta organização.",
        });
      }

      // 🔹 Monta payload formatado
      const payload = JSON.stringify({
        title: titulo || "Teste de Push",
        body: mensagem || "Notificação enviada com sucesso!",
      });

      let enviados = 0;

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            payload
          );

          enviados++;
        } catch (err: any) {
          logger.warn("[notificacoesPushRoutes] Erro ao enviar para subscription", {
            endpoint: sub.endpoint,
            error: err.message,
          });
        }
      }

      return res.json({
        success: true,
        enviados,
        total: subs.length,
      });

    } catch (error: any) {
      logger.error("[notificacoesPushRoutes] Erro no envio de push", {
        message: error.message,
      });

      return res.status(500).json({ error: error.message });
    }
  }
);

/**
 * 📌 POST /api/notificacoes-push/enviar
 * Envia uma notificação real (usado pelo sistema)
 */
router.post(
  "/enviar",
  verifyToken,
  async (req, res) => {
    try {
      const usuario = req.usuario;
      const organizacao_id = usuario.organizacao_id;

      const { title, body } = req.body;

      if (!title || !body) {
        return res.status(400).json({
          error: "Campos 'title' e 'body' são obrigatórios."
        });
      }

      logger.debug("[notificacoesPushRoutes] Enviando push real", {
        organizacao_id,
        title,
        body,
      });

      // 🔥 Chama o service oficial
      await notificacoesPushService.enviarNotificacaoParaOrganizacao(
        organizacao_id,
        title,
        body
      );

      return res.json({ success: true });

    } catch (err: any) {
      logger.error("[notificacoesPushRoutes] Erro ao enviar push real", {
        message: err.message,
      });

      return res.status(500).json({
        error: err.message || "Erro interno ao enviar push."
      });
    }
  }
);


logger.info("[notificacoesPushRoutes] Rotas carregadas com sucesso! 🚀");

export default router;

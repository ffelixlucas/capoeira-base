import { Request, Response } from "express";
import logger from "../../utils/logger";
import notificacoesPushService from "./notificacoesPushService";

const notificacoesPushController = {
  /** ******************************************************************
   *  🔹 Salvar ou atualizar subscription do usuário
   ******************************************************************* */
  async salvarSubscription(req: Request, res: Response) {
    try {
      const usuario = req.usuario; // vem do verifyToken
      const organizacao_id = usuario.organizacao_id;

      const { endpoint, keys } = req.body;

      logger.debug("[notificacoesPushController] Recebendo subscription", {
        usuario_id: usuario.id,
        organizacao_id,
        endpoint,
      });

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({
          error: "Subscription inválida: faltando endpoint ou chaves.",
        });
      }

      await notificacoesPushService.salvarSubscription({
        usuario_id: usuario.id,
        organizacao_id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });

      return res.json({ success: true });

    } catch (err: any) {
      logger.error("[notificacoesPushController] Erro ao salvar subscription", {
        message: err.message,
      });
      return res.status(500).json({ error: err.message || "Erro interno." });
    }
  },

  /** ******************************************************************
   *  🔹 Listar subscriptions de uma organização
   ******************************************************************* */
  async listarPorOrganizacao(req: Request, res: Response) {
    try {
      const usuario = req.usuario;
      const organizacao_id = usuario.organizacao_id;

      const rows = await notificacoesPushService.listarSubscriptions(
        organizacao_id
      );

      return res.json({ success: true, data: rows });

    } catch (err: any) {
      logger.error("[notificacoesPushController] Erro ao listar subscriptions", {
        message: err.message,
      });
      return res.status(500).json({ error: err.message || "Erro interno." });
    }
  },

  /** ******************************************************************
   *  🔹 Enviar notificação PUSH real para todos da organização
   ******************************************************************* */
  async enviarNotificacao(req: Request, res: Response) {
    try {
      const usuario = req.usuario;
      const organizacao_id = usuario.organizacao_id;

      const { title, body } = req.body;

      if (!title || !body) {
        return res.status(400).json({ error: "title e body são obrigatórios" });
      }

      logger.debug("[notificacoesPushController] Enviando notificação", {
        usuario_id: usuario.id,
        organizacao_id,
        title,
        body,
      });

      await notificacoesPushService.enviarNotificacaoParaOrganizacao(
        organizacao_id,
        title,
        body
      );

      return res.json({ success: true });

    } catch (err: any) {
      logger.error("[notificacoesPushController] Erro ao enviar notificação", {
        message: err.message,
      });
      return res.status(500).json({ error: err.message || "Erro interno." });
    }
  },
};

export default notificacoesPushController;

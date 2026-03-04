import { Request, Response } from "express";
import logger from "../../../utils/logger";
import {
  buscarContatoAdminPorOrganizacaoId,
  atualizarContatoAdminPorOrganizacaoId
} from "./organizacaoService";

function usuarioPodeGerenciarConfig(req: Request): boolean {
  const roles = req.usuario?.roles || [];
  return Array.isArray(roles) && roles.includes("admin");
}

export async function getMeuContatoOrganizacao(req: Request, res: Response) {
  try {
    if (!usuarioPodeGerenciarConfig(req)) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    const organizacaoId = req.usuario.organizacao_id;
    const contato = await buscarContatoAdminPorOrganizacaoId(organizacaoId);

    return res.json({
      success: true,
      data: contato
    });
  } catch (err: any) {
    logger.error("[organizacaoAdminController] Erro ao buscar contato da organização", err?.message || err);
    return res.status(500).json({ message: "Erro ao buscar contato da organização." });
  }
}

export async function putMeuContatoOrganizacao(req: Request, res: Response) {
  try {
    if (!usuarioPodeGerenciarConfig(req)) {
      return res.status(403).json({ message: "Acesso negado." });
    }

    const organizacaoId = req.usuario.organizacao_id;
    const whatsapp = String(req.body?.whatsapp_contato || "").trim();

    if (!whatsapp) {
      return res.status(400).json({ message: "Informe o WhatsApp de contato." });
    }

    if (whatsapp.length > 30) {
      return res.status(400).json({ message: "WhatsApp deve ter no máximo 30 caracteres." });
    }

    await atualizarContatoAdminPorOrganizacaoId(organizacaoId, whatsapp);
    const atualizado = await buscarContatoAdminPorOrganizacaoId(organizacaoId);

    return res.json({
      success: true,
      message: "Contato atualizado com sucesso.",
      data: atualizado
    });
  } catch (err: any) {
    logger.error("[organizacaoAdminController] Erro ao atualizar contato da organização", err?.message || err);
    return res.status(500).json({ message: "Erro ao atualizar contato da organização." });
  }
}

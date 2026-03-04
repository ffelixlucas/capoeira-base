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
    const telefone = String(req.body?.telefone || "").trim();
    const whatsapp = String(req.body?.whatsapp_contato || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const endereco = String(req.body?.endereco || "").trim();
    const cidade = String(req.body?.cidade || "").trim();
    const estado = String(req.body?.estado || "").trim();
    const pais = String(req.body?.pais || "").trim();

    if (!telefone) {
      return res.status(400).json({ message: "Informe o telefone de contato." });
    }

    if (telefone.length > 30 || whatsapp.length > 30) {
      return res.status(400).json({ message: "Telefone/WhatsApp deve ter no máximo 30 caracteres." });
    }

    if (!email) {
      return res.status(400).json({ message: "Informe o e-mail de contato." });
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
      return res.status(400).json({ message: "E-mail de contato invalido." });
    }

    if (!endereco) {
      return res.status(400).json({ message: "Informe o endereco de contato." });
    }

    if (email.length > 150) {
      return res.status(400).json({ message: "E-mail deve ter no maximo 150 caracteres." });
    }

    if (endereco.length > 200) {
      return res.status(400).json({ message: "Endereco deve ter no maximo 200 caracteres." });
    }

    await atualizarContatoAdminPorOrganizacaoId(organizacaoId, {
      telefone,
      whatsapp_contato: whatsapp || telefone,
      email,
      endereco,
      cidade,
      estado,
      pais
    });
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

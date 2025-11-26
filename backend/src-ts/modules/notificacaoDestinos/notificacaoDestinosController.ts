import { Request, Response } from "express";
import * as service from "./notificacaoDestinosService";
import  logger  from "../../utils/logger";

/**
 * Lista notificações por tipo (multi-organização)
 */
export async function getPorTipo(req: Request, res: Response) {
  try {
    const usuario: any = (req as any).usuario || (req as any).user;
    const organizacaoId = usuario?.organizacao_id;
    const grupoId = parseInt(req.params.grupoId, 10);
    const { tipo } = req.params;

    if (!organizacaoId || !grupoId || !tipo) {
      return res
        .status(400)
        .json({ error: "Organização, grupo ou tipo não informado." });
    }

    const lista = await service.listar(organizacaoId, grupoId, tipo);

    logger.debug(
      `[notificacaoDestinosController] org ${organizacaoId} - retornando ${lista.length} registros (${tipo})`
    );

    return res.json({ success: true, data: lista });
  } catch (err: any) {
    logger.error("[notificacaoDestinosController] Erro ao listar:", err);
    return res.status(500).json({ error: "Erro ao listar notificações" });
  }
}

/**
 * Cria nova notificação
 */
export async function post(req: Request, res: Response) {
  try {
    const usuario: any = (req as any).usuario || (req as any).user;
    const organizacaoId = usuario?.organizacao_id;
    const grupoId = req.body.grupoId ?? usuario?.grupo_id;
    const { tipo, email } = req.body;

    if (!organizacaoId || !grupoId || !tipo || !email) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    const novo = await service.adicionar(organizacaoId, grupoId, tipo, email);

    logger.info(
      `[notificacaoDestinosController] org ${organizacaoId} - notificação criada (${email})`
    );

    return res.status(201).json({ success: true, data: novo });
  } catch (err: any) {
    logger.error("[notificacaoDestinosController] Erro ao criar:", err);
    return res.status(400).json({ error: "Erro ao criar notificação" });
  }
}

/**
 * Deleta notificação
 */
export async function del(req: Request, res: Response) {
  try {
    const usuario: any = (req as any).usuario || (req as any).user;
    const organizacaoId = usuario?.organizacao_id;
    const { id } = req.params;

    if (!organizacaoId || !id) {
      return res.status(400).json({ error: "Parâmetros ausentes" });
    }

    await service.deletar(Number(id), organizacaoId);

    logger.warn(
      `[notificacaoDestinosController] org ${organizacaoId} - notificação removida id ${id}`
    );

    return res.json({ success: true });
  } catch (err: any) {
    logger.error("[notificacaoDestinosController] Erro ao remover:", err);
    return res.status(400).json({ error: "Erro ao remover notificação" });
  }
}

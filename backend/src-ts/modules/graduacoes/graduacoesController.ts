// modules/graduacoes/graduacoesController.ts
// Controlador responsável pelas operações de CRUD relacionadas às graduações.
// Todas as rotas são protegidas por RBAC e vinculadas à organização do usuário autenticado.

import { Request, Response } from "express";
import graduacoesService from "./graduacoesService";
import logger  from "../../utils/logger";

/**
 * Lista graduações filtradas pela categoria.
 * A consulta é sempre limitada à organização do usuário autenticado.
 */
async function listarPorCategoria(req: Request, res: Response) {
  try {
    const categoriaId =
      (req.params as any).categoriaId || (req.query as any).categoria_id;

    const usuario = (req as any).usuario || (req as any).user;
    const organizacaoId = usuario.organizacao_id;

    if (!categoriaId) {
      return res.status(400).json({
        sucesso: false,
        erro: "categoria_id é obrigatório",
      });
    }

    const graduacoes = await graduacoesService.listarPorCategoria(
      categoriaId,
      organizacaoId
    );

    return res.json({ sucesso: true, data: graduacoes });
  } catch (err: any) {
    logger.error("[graduacoesController] listarPorCategoria", err);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar graduações",
    });
  }
}

/**
 * Lista todas as graduações cadastradas na organização.
 * Inclui nome da categoria vinculada.
 */
async function listarTodas(req: Request, res: Response) {
  try {
    const usuario = (req as any).usuario || (req as any).user;
    const organizacaoId = usuario.organizacao_id;

    const graduacoes = await graduacoesService.listarTodas(organizacaoId);

    return res.json({ sucesso: true, data: graduacoes });
  } catch (err: any) {
    logger.error("[graduacoesController] listarTodas", err);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar graduações",
    });
  }
}

/**
 * Cria uma nova graduação dentro da organização atual.
 */
async function criar(req: Request, res: Response) {
  try {
    const { categoriaId, nome, ordem } = req.body;

    const usuario = (req as any).usuario || (req as any).user;
    const organizacaoId = usuario.organizacao_id;

    if (!categoriaId || !nome || !ordem) {
      return res.status(400).json({
        sucesso: false,
        erro: "categoriaId, nome e ordem são obrigatórios",
      });
    }

    const id = await graduacoesService.criar({
      categoriaId,
      nome,
      ordem,
      organizacaoId,
    });

    return res.status(201).json({ sucesso: true, id });
  } catch (err: any) {
    logger.error("[graduacoesController] criar", err);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao criar graduação",
    });
  }
}

/**
 * Atualiza os dados de uma graduação, desde que pertença à organização do usuário autenticado.
 */
async function atualizar(req: Request, res: Response) {
  try {
    const id = (req.params as any).id;
    const { nome, ordem } = req.body;

    const usuario = (req as any).usuario || (req as any).user;
    const organizacaoId = usuario.organizacao_id;

    const ok = await graduacoesService.atualizar(id, {
      nome,
      ordem,
      organizacaoId,
    });

    if (!ok) {
      return res.status(404).json({
        sucesso: false,
        erro: "Graduação não encontrada",
      });
    }

    return res.json({ sucesso: true });
  } catch (err: any) {
    logger.error("[graduacoesController] atualizar", err);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao atualizar graduação",
    });
  }
}

/**
 * Remove uma graduação, respeitando os limites de organização.
 */
async function remover(req: Request, res: Response) {
  try {
    const id = (req.params as any).id;

    const usuario = (req as any).usuario || (req as any).user;
    const organizacaoId = usuario.organizacao_id;

    const ok = await graduacoesService.remover(id, organizacaoId);

    if (!ok) {
      return res.status(404).json({
        sucesso: false,
        erro: "Graduação não encontrada",
      });
    }

    return res.json({ sucesso: true });
  } catch (err: any) {
    logger.error("[graduacoesController] remover", err);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao remover graduação",
    });
  }
}

/**
 * Busca uma graduação específica, garantindo que pertence à organização do usuário.
 */
async function buscarPorId(req: Request, res: Response) {
  try {
    const id = (req.params as any).id;

    const usuario = (req as any).usuario || (req as any).user;
    const organizacaoId = usuario.organizacao_id;

    const graduacao = await graduacoesService.buscarPorId(id, organizacaoId);

    if (!graduacao) {
      return res.status(404).json({
        sucesso: false,
        erro: "Graduação não encontrada",
      });
    }

    return res.json({ sucesso: true, data: graduacao });
  } catch (err: any) {
    logger.error("[graduacoesController] buscarPorId", err);
    return res.status(500).json({
      sucesso: false,
      erro: "Erro ao buscar graduação",
    });
  }
}

export default {
  listarPorCategoria,
  listarTodas,
  criar,
  atualizar,
  remover,
  buscarPorId,
};

import { Request, Response } from "express";
import { logger } from "../../utils/logger";
import * as service from "./presencasService";

/* --------------------------------------------------------- */
/* GET /api/presencas?turma_id=1&data=2025-08-09              */
/* --------------------------------------------------------- */
export async function listarPorTurmaEData(req: Request, res: Response) {
  try {
    const { turma_id, data } = req.query;

    if (!turma_id || !data) {
      return res
        .status(400)
        .json({ erro: "turma_id e data são obrigatórios" });
    }

    const result = await service.listarPorTurmaEData({
      user: (req as any).user,
      turma_id: Number(turma_id),
      data: String(data),
    });

    return res.json(result);
  } catch (e: any) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || "Falha ao listar presenças",
    });
  }
}

/* --------------------------------------------------------- */
/* POST /api/presencas/batch                                  */
/* Body: { turma_id, data, itens[] }                          */
/* --------------------------------------------------------- */
export async function salvarBatch(req: Request, res: Response) {
  try {
    const { turma_id, data, itens } = req.body;

    if (!turma_id || !data || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "turma_id, data e itens[] são obrigatórios",
      });
    }

    const result = await service.salvarBatch({
      user: (req as any).user,
      turma_id: Number(turma_id),
      data: String(data),
      itens,
    });

    return res.status(201).json(result);
  } catch (e: any) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || "Falha ao salvar presenças",
    });
  }
}

/* --------------------------------------------------------- */
/* PUT /api/presencas/:id                                     */
/* Body: { status, observacao }                               */
/* --------------------------------------------------------- */
export async function atualizarUma(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { status, observacao } = req.body;

    if (!id || (!status && typeof observacao === "undefined")) {
      return res.status(400).json({
        erro: "id e (status ou observacao) são obrigatórios",
      });
    }

    await service.atualizarUma({
      user: (req as any).user,
      id,
      status,
      observacao,
    });

    return res.json({ ok: true });
  } catch (e: any) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || "Falha ao atualizar presença",
    });
  }
}

/* --------------------------------------------------------- */
/* GET /api/presencas/relatorio                               */
/* --------------------------------------------------------- */
export async function relatorioPorPeriodo(req: Request, res: Response) {
  try {
    const { inicio, fim } = req.query;

    if (!inicio || !fim) {
      return res
        .status(400)
        .json({ erro: "inicio e fim são obrigatórios" });
    }

    const result = await service.relatorioPorPeriodo({
      user: (req as any).user,
      inicio: String(inicio),
      fim: String(fim),
    });

    return res.json(result);
  } catch (e: any) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || "Falha ao gerar relatório",
    });
  }
}

/* --------------------------------------------------------- */
/* GET /api/presencas/resumo-dia?data=2026-03-05            */
/* --------------------------------------------------------- */
export async function resumoDia(req: Request, res: Response) {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ erro: "data é obrigatória" });
    }

    const result = await service.resumoDia({
      user: (req as any).user,
      data: String(data),
    });

    return res.json(result);
  } catch (e: any) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || "Falha ao gerar resumo diário",
    });
  }
}

/* --------------------------------------------------------- */
/* GET /api/presencas/atividades-recentes?limit=20          */
/* --------------------------------------------------------- */
export async function atividadesRecentes(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit || 20);
    const turma_id = req.query.turma_id ? Number(req.query.turma_id) : undefined;
    const user = (req as any).user;
    logger.debug("[presencasController] atividadesRecentes:entrada", {
      userId: user?.id,
      organizacaoId: user?.organizacao_id,
      roles: user?.roles,
      limitRecebido: req.query.limit,
      limitNormalizado: Number.isFinite(limit) && limit > 0 ? limit : 20,
      turmaIdRecebida: req.query.turma_id,
      turmaIdNormalizada:
        Number.isFinite(turma_id as number) && (turma_id as number) > 0
          ? (turma_id as number)
          : undefined,
    });

    const result = await service.atividadesRecentes({
      user,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
      turma_id: Number.isFinite(turma_id as number) && (turma_id as number) > 0 ? (turma_id as number) : undefined,
    });

    logger.debug("[presencasController] atividadesRecentes:saida", {
      tipo: (result as any)?.tipo,
      atividades: Array.isArray((result as any)?.atividades)
        ? (result as any).atividades.length
        : undefined,
      historico: Array.isArray((result as any)?.historico)
        ? (result as any).historico.length
        : undefined,
      atividadeData: (result as any)?.atividade?.data,
      atividadeTurmaId: (result as any)?.atividade?.turma_id,
    });

    return res.json(result);
  } catch (e: any) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || "Falha ao buscar atividades recentes",
    });
  }
}

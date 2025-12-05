import { Request, Response } from "express";
import horariosService from "./horariosService";
import logger from "../../utils/logger";

/* -------------------------------------------------------------------------- */
/* ➕ Criar horário                                                             */
/* -------------------------------------------------------------------------- */
async function criarHorario(req: Request, res: Response) {
  try {
    const usuario = (req as any).usuario;
    const organizacao_id = usuario.organizacao_id;

    const dados = {
      ...req.body,
      organizacao_id,
    };

    logger.debug("[horariosController] Payload recebido", dados);

    const novo = await horariosService.criarHorario(dados);

    return res.status(201).json(novo);
  } catch (err: any) {
    logger.error("[horariosController.criarHorario] Erro:", err.message);
    return res.status(400).json({ error: err.message });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔍 Listar horários da turma                                                */
/* -------------------------------------------------------------------------- */
async function listarPorTurma(req: Request, res: Response) {
  try {
    const usuario = (req as any).usuario;
    const organizacao_id = usuario.organizacao_id;
    const turmaId = Number(req.params.turmaId);

    const horarios = await horariosService.listarPorTurma(
      turmaId,
      organizacao_id
    );

    return res.json(horarios);
  } catch (err: any) {
    logger.error("[horariosController.listar] Erro:", err.message);
    return res.status(400).json({ error: err.message });
  }
}

/* -------------------------------------------------------------------------- */
/* ❌ Deletar horário                                                          */
/* -------------------------------------------------------------------------- */
async function deletarHorario(req: Request, res: Response) {
  try {
    const usuario = (req as any).usuario;
    const organizacao_id = usuario.organizacao_id;
    const id = Number(req.params.id);

    await horariosService.deletarHorario(id, organizacao_id);

    return res.json({ sucesso: true });
  } catch (err: any) {
    logger.error("[horariosController.deletar] Erro:", err.message);
    return res.status(400).json({ error: err.message });
  }
}

export default {
  criarHorario,
  listarPorTurma,
  deletarHorario,
};

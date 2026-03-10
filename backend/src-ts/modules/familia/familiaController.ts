import { Request, Response } from "express";
import {
  atualizarAlunoFamiliaService,
  buscarAlunoFamiliaService,
  buscarPerfilFamiliaService,
  listarAlunosFamiliaService,
  loginComFirebaseService,
} from "./familiaService";
import logger from "../../utils/logger";

export async function loginComFirebase(req: Request, res: Response) {
  try {
    const payload = await loginComFirebaseService({
      slug: req.body?.slug,
      cpf: req.body?.cpf,
      firebaseToken: req.body?.firebaseToken,
    });

    return res.status(200).json(payload);
  } catch (err: any) {
    logger.error("[familiaController] Erro ao autenticar portal da família", {
      erro: err.message,
    });
    return res.status(400).json({ error: err.message || "Erro ao autenticar." });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const perfil = await buscarPerfilFamiliaService((req as any).usuario);
    return res.status(200).json(perfil);
  } catch (err: any) {
    logger.error("[familiaController] Erro ao carregar perfil do portal da família", {
      erro: err.message,
    });
    return res.status(400).json({ error: err.message || "Erro ao carregar perfil." });
  }
}

export async function listarAlunos(req: Request, res: Response) {
  try {
    const alunos = await listarAlunosFamiliaService((req as any).usuario);
    return res.status(200).json(alunos);
  } catch (err: any) {
    logger.error("[familiaController] Erro ao listar alunos vinculados", {
      erro: err.message,
    });
    return res.status(400).json({ error: err.message || "Erro ao listar alunos." });
  }
}

export async function buscarAluno(req: Request, res: Response) {
  try {
    const aluno = await buscarAlunoFamiliaService(
      (req as any).usuario,
      Number(req.params.id)
    );
    return res.status(200).json(aluno);
  } catch (err: any) {
    logger.error("[familiaController] Erro ao buscar aluno vinculado", {
      erro: err.message,
    });
    return res.status(400).json({ error: err.message || "Erro ao buscar aluno." });
  }
}

export async function atualizarAluno(req: Request, res: Response) {
  try {
    const aluno = await atualizarAlunoFamiliaService(
      (req as any).usuario,
      Number(req.params.id),
      req.body || {}
    );
    return res.status(200).json(aluno);
  } catch (err: any) {
    logger.error("[familiaController] Erro ao atualizar aluno vinculado", {
      erro: err.message,
    });
    return res.status(400).json({ error: err.message || "Erro ao atualizar aluno." });
  }
}

import { Request, Response } from "express";
import matriculaService from "./matriculaService";
import logger from "../../utils/logger";

async function criarMatricula(req: Request, res: Response) {
  try {
    const usuario = (req as any).usuario || (req as any).user;
    const dados = { ...req.body, usuario };

    logger.info("[matriculaController] Criando matrícula", {
      nome: dados?.nome,
      organizacao_id:
        usuario?.organizacao_id || dados?.organizacao_id || "não informado",
    });

    const resultado = await matriculaService.criarMatricula(dados);
    return res.status(201).json(resultado);
  } catch (err: any) {
    logger.error("[matriculaController] Erro ao criar matrícula:", err.message);

    return res.status(400).json({
      error: "Erro ao criar matrícula.",
      detalhes: err.message,
    });
  }
}

async function buscarPorCpf(req: Request, res: Response) {
  try {
    const { cpf } = req.params;
    const usuario = (req as any).usuario || (req as any).user;

    logger.info("[matriculaController] Buscando matrícula por CPF", { 
      cpf,
      organizacao_id: usuario?.organizacao_id
    });

    const resultado = await matriculaService.buscarPorCpf(
      cpf,
      usuario.organizacao_id
    );

    return res.json(resultado);

  } catch (err: any) {
    logger.error("[matriculaController] Erro ao buscar CPF:", err.message);

    return res.status(400).json({
      error: "Erro ao buscar matrícula por CPF.",
      detalhes: err.message,
    });
  }
}


/* 🔥 ÚNICO ENDPOINT CORRETO PARA APROVAR PRÉ-MATRÍCULA */
async function aprovarPreMatricula(req: Request, res: Response) {
  try {
    const { pre_matricula_id, turma_id } = req.body;
    const usuario = (req as any).usuario || (req as any).user;

    if (!pre_matricula_id || !turma_id) {
      return res.status(400).json({
        sucesso: false,
        erro: "pre_matricula_id e turma_id são obrigatórios.",
      });
    }

    logger.info("[matriculaController] Aprovando pré-matrícula manualmente", {
      pre_matricula_id,
      turma_id,
      usuario_id: usuario?.id,
      organizacao_id: usuario?.organizacao_id,
    });

    // 🔥 agora enviamos com os nomes que o service espera:
    const resultado = await matriculaService.aprovarPreMatricula({
      preMatriculaId: pre_matricula_id,
      turma_id,
      organizacao_id: usuario.organizacao_id,
    });

    return res.json(resultado);

  } catch (err: any) {
    logger.error("[matriculaController] Erro:", err.message);

    return res.status(400).json({
      sucesso: false,
      erro: "Erro ao aprovar pré-matrícula.",
      detalhes: err.message,
    });
  }
}


export default {
  criarMatricula,
  buscarPorCpf,
  aprovarPreMatricula,
};

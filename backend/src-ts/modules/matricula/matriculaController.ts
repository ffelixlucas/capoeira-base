import { Request, Response } from "express";
import matriculaService from "./matriculaService";
import logger  from "../../utils/logger";

/* -------------------------------------------------------------------------- */
/* 🔹 Criação de matrícula                                                    */
/* -------------------------------------------------------------------------- */
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
    logger.error(
      "[matriculaController] Erro ao criar matrícula:",
      err.message
    );

    return res.status(400).json({
      error: "Erro ao criar matrícula.",
      detalhes: err.message,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Buscar matrícula por CPF (teste rápido)                                 */
/* -------------------------------------------------------------------------- */
async function buscarPorCpf(req: Request, res: Response) {
  try {
    const { cpf } = req.params;

    logger.info("[matriculaController] Buscando matrícula por CPF", { cpf });

    const resultado = await matriculaService.buscarPorCpf(cpf);
    return res.json(resultado);
  } catch (err: any) {
    logger.error(
      "[matriculaController] Erro ao buscar matrícula por CPF:",
      err.message
    );

    return res.status(400).json({
      error: "Erro ao buscar matrícula por CPF.",
      detalhes: err.message,
    });
  }
}

export default {
  criarMatricula,
  buscarPorCpf,
  };

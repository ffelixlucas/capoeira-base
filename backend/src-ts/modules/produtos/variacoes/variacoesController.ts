import { Request, Response } from "express";
import variacoesService from "./variacoesService";

async function listarTipos(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;

    const tipos =
      await variacoesService.listarTiposVariacaoService(
        organizacaoId
      );

    return res.json({
      success: true,
      data: tipos,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function listarValores(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const tipoId = Number(req.params.tipoId);

    const valores =
      await variacoesService.listarValoresPorTipoService(
        organizacaoId,
        tipoId
      );

    return res.json({
      success: true,
      data: valores,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export default {
  listarTipos,
  listarValores,
};
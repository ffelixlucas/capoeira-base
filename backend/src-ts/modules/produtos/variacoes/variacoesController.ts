import { Request, Response } from "express";
import variacoesService from "./variacoesService";

/* ======================================================
   LISTAR TIPOS
====================================================== */

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

/* ======================================================
   LISTAR VALORES
====================================================== */

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

/* ======================================================
   CRIAR TIPO
====================================================== */

async function criarTipo(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const { nome } = req.body;

    const tipoId =
      await variacoesService.criarTipoVariacaoService(
        organizacaoId,
        nome
      );

    return res.status(201).json({
      success: true,
      data: { id: tipoId },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/* ======================================================
   ATUALIZAR TIPO
====================================================== */

async function atualizarTipo(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const tipoId = Number(req.params.tipoId);
    const { nome } = req.body;

    await variacoesService.atualizarTipoVariacaoService(
      organizacaoId,
      tipoId,
      nome
    );

    return res.json({
      success: true,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/* ======================================================
   EXCLUIR TIPO
====================================================== */

async function excluirTipo(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const tipoId = Number(req.params.tipoId);

    await variacoesService.excluirTipoVariacaoService(
      organizacaoId,
      tipoId
    );

    return res.json({
      success: true,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/* ======================================================
   CRIAR VALOR
====================================================== */

async function criarValor(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const { tipoId, valor } = req.body;

    const valorId =
      await variacoesService.criarValorVariacaoService(
        organizacaoId,
        tipoId,
        valor
      );

    return res.status(201).json({
      success: true,
      data: { id: valorId },
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/* ======================================================
   ATUALIZAR VALOR
====================================================== */

async function atualizarValor(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const valorId = Number(req.params.valorId);
    const { valor } = req.body;

    await variacoesService.atualizarValorVariacaoService(
      organizacaoId,
      valorId,
      valor
    );

    return res.json({
      success: true,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/* ======================================================
   EXCLUIR VALOR
====================================================== */

async function excluirValor(req: Request, res: Response) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const valorId = Number(req.params.valorId);

    await variacoesService.excluirValorVariacaoService(
      organizacaoId,
      valorId
    );

    return res.json({
      success: true,
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
  criarTipo,
  atualizarTipo,
  excluirTipo,
  criarValor,
  atualizarValor,
  excluirValor,
};

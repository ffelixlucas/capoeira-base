import { Request, Response } from "express";
import financeiroService from "./financeiroService";
import logger from "../../utils/logger";

async function listar(req: Request, res: Response) {
  const organizacaoId = req.usuario.organizacao_id;
  const { status, origem } = req.query;

  logger.debug("[financeiroController] listar", {
    organizacaoId,
    status,
    origem,
  });

  const cobrancas = await financeiroService.listarCobrancas({
    organizacaoId,
    status: status as string | undefined,
    origem: origem as string | undefined,
  });

  return res.json({
    success: true,
    data: cobrancas,
  });
}

async function buscarPorId(req: Request, res: Response) {
  const organizacaoId = req.usuario.organizacao_id;
  const cobrancaId = Number(req.params.id);

  logger.debug("[financeiroController] buscarPorId", {
    organizacaoId,
    cobrancaId,
  });

  const cobranca = await financeiroService.buscarCobrancaPorId(
    organizacaoId,
    cobrancaId
  );

  return res.json({
    success: true,
    data: cobranca,
  });
}

export default {
  listar,
  buscarPorId,
};

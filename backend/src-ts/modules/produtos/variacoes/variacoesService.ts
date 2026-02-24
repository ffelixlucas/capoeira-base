import logger from "../../../utils/logger";
import variacoesRepository from "./variacoesRepository";

async function listarTiposVariacaoService(
  organizacaoId: number
) {
  if (!organizacaoId) {
    throw new Error("Organização inválida");
  }

  const tipos =
    await variacoesRepository.listarTiposVariacao(
      organizacaoId
    );

  logger.debug("[variacoesService] tipos listados", {
    organizacaoId,
    total: (tipos as any[]).length,
  });

  return tipos;
}

async function listarValoresPorTipoService(
  organizacaoId: number,
  tipoId: number
) {
  if (!organizacaoId || !tipoId) {
    throw new Error("Parâmetros inválidos");
  }

  const valores =
    await variacoesRepository.listarValoresPorTipo(
      organizacaoId,
      tipoId
    );

  logger.debug("[variacoesService] valores listados", {
    organizacaoId,
    tipoId,
    total: (valores as any[]).length,
  });

  return valores;
}

export default {
  listarTiposVariacaoService,
  listarValoresPorTipoService,
};
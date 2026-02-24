import logger from "../../../utils/logger";
import variacoesRepository from "./variacoesRepository";

/* ======================================================
   LISTAR TIPOS
====================================================== */

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

/* ======================================================
   LISTAR VALORES
====================================================== */

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

/* ======================================================
   CRIAR TIPO
====================================================== */

async function criarTipoVariacaoService(
  organizacaoId: number,
  nome: string
) {
  if (!organizacaoId) {
    throw new Error("Organização inválida");
  }

  if (!nome || nome.trim().length < 2) {
    throw new Error("Nome inválido");
  }

  const tipoId =
    await variacoesRepository.criarTipoVariacao(
      organizacaoId,
      nome.trim()
    );

  logger.info("[variacoesService] tipo criado", {
    organizacaoId,
    tipoId,
  });

  return tipoId;
}

/* ======================================================
   EXCLUIR TIPO
====================================================== */

async function excluirTipoVariacaoService(
  organizacaoId: number,
  tipoId: number
) {
  if (!organizacaoId || !tipoId) {
    throw new Error("Parâmetros inválidos");
  }

  await variacoesRepository.excluirTipoVariacao(
    organizacaoId,
    tipoId
  );

  logger.info("[variacoesService] tipo excluído", {
    organizacaoId,
    tipoId,
  });
}

/* ======================================================
   CRIAR VALOR
====================================================== */

async function criarValorVariacaoService(
  organizacaoId: number,
  tipoId: number,
  valor: string
) {
  if (!organizacaoId || !tipoId) {
    throw new Error("Parâmetros inválidos");
  }

  if (!valor || valor.trim().length < 1) {
    throw new Error("Valor inválido");
  }

  const valorId =
    await variacoesRepository.criarValorVariacao(
      organizacaoId,
      tipoId,
      valor.trim()
    );

  logger.info("[variacoesService] valor criado", {
    organizacaoId,
    tipoId,
    valorId,
  });

  return valorId;
}

/* ======================================================
   EXCLUIR VALOR
====================================================== */

async function excluirValorVariacaoService(
  organizacaoId: number,
  valorId: number
) {
  if (!organizacaoId || !valorId) {
    throw new Error("Parâmetros inválidos");
  }

  await variacoesRepository.excluirValorVariacao(
    organizacaoId,
    valorId
  );

  logger.info("[variacoesService] valor excluído", {
    organizacaoId,
    valorId,
  });
}

export default {
  listarTiposVariacaoService,
  listarValoresPorTipoService,
  criarTipoVariacaoService,
  excluirTipoVariacaoService,
  criarValorVariacaoService,
  excluirValorVariacaoService,
};
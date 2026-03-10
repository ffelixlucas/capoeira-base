import logger from "../../../utils/logger";
import variacoesRepository from "./variacoesRepository";

function traduzirErroBanco(error: any, tipoEntidade: "tipo" | "valor") {
  if (error?.code === "ER_DUP_ENTRY") {
    return new Error(
      tipoEntidade === "tipo"
        ? "Ja existe um tipo com esse nome"
        : "Ja existe um valor igual para esse tipo"
    );
  }

  return error;
}

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

  let tipoId: number;

  try {
    tipoId =
      await variacoesRepository.criarTipoVariacao(
        organizacaoId,
        nome.trim()
      );
  } catch (error: any) {
    throw traduzirErroBanco(error, "tipo");
  }

  logger.info("[variacoesService] tipo criado", {
    organizacaoId,
    tipoId,
  });

  return tipoId;
}

/* ======================================================
   ATUALIZAR TIPO
====================================================== */

async function atualizarTipoVariacaoService(
  organizacaoId: number,
  tipoId: number,
  nome: string
) {
  if (!organizacaoId || !tipoId) {
    throw new Error("Parametros invalidos");
  }

  if (!nome || nome.trim().length < 2) {
    throw new Error("Nome invalido");
  }

  let afetados: number;

  try {
    afetados =
      await variacoesRepository.atualizarTipoVariacao(
        organizacaoId,
        tipoId,
        nome.trim()
      );
  } catch (error: any) {
    throw traduzirErroBanco(error, "tipo");
  }

  if (!afetados) {
    throw new Error("Tipo nao encontrado");
  }

  logger.info("[variacoesService] tipo atualizado", {
    organizacaoId,
    tipoId,
  });
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

  let valorId: number;

  try {
    valorId =
      await variacoesRepository.criarValorVariacao(
        organizacaoId,
        tipoId,
        valor.trim()
      );
  } catch (error: any) {
    throw traduzirErroBanco(error, "valor");
  }

  logger.info("[variacoesService] valor criado", {
    organizacaoId,
    tipoId,
    valorId,
  });

  return valorId;
}

/* ======================================================
   ATUALIZAR VALOR
====================================================== */

async function atualizarValorVariacaoService(
  organizacaoId: number,
  valorId: number,
  valor: string
) {
  if (!organizacaoId || !valorId) {
    throw new Error("Parametros invalidos");
  }

  if (!valor || valor.trim().length < 1) {
    throw new Error("Valor invalido");
  }

  let afetados: number;

  try {
    afetados =
      await variacoesRepository.atualizarValorVariacao(
        organizacaoId,
        valorId,
        valor.trim()
      );
  } catch (error: any) {
    throw traduzirErroBanco(error, "valor");
  }

  if (!afetados) {
    throw new Error("Valor nao encontrado");
  }

  logger.info("[variacoesService] valor atualizado", {
    organizacaoId,
    valorId,
  });
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
  atualizarTipoVariacaoService,
  excluirTipoVariacaoService,
  criarValorVariacaoService,
  atualizarValorVariacaoService,
  excluirValorVariacaoService,
};

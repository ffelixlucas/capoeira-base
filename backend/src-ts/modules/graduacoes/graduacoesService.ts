import  logger  from "../../utils/logger";
import graduacoesRepository from "./graduacoesRepository";

// Tipagem mínima, sem travar migração (ajustamos depois)
type DadosGraduacao = {
  categoriaId?: number;
  nome?: string;
  ordem?: number;
  organizacaoId: number;
};

/* -------------------------------------------------------------------------- */
/* 🔍 Listar por categoria                                                    */
/* -------------------------------------------------------------------------- */
async function listarPorCategoria(categoriaId: number, organizacaoId: number) {
  logger.debug("[graduacoesService] listarPorCategoria", {
    categoriaId,
    organizacaoId,
  });

  return graduacoesRepository.listarPorCategoria(categoriaId, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔍 Listar todas                                                            */
/* -------------------------------------------------------------------------- */
async function listarTodas(organizacaoId: number) {
  logger.debug("[graduacoesService] listarTodas", { organizacaoId });

  return graduacoesRepository.listarTodas(organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* ➕ Criar graduação                                                          */
/* -------------------------------------------------------------------------- */
async function criar({ categoriaId, nome, ordem, organizacaoId }: DadosGraduacao) {
  logger.info("[graduacoesService] criar", {
    categoriaId,
    nome,
    ordem,
    organizacaoId,
  });

  return graduacoesRepository.criar({
    categoriaId,
    nome,
    ordem,
    organizacaoId,
  });
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar                                                               */
/* -------------------------------------------------------------------------- */
async function atualizar(
  id: number,
  { nome, ordem, organizacaoId }: DadosGraduacao
) {
  logger.info("[graduacoesService] atualizar", {
    id,
    nome,
    ordem,
    organizacaoId,
  });

  return graduacoesRepository.atualizar(id, {
    nome,
    ordem,
    organizacaoId,
  });
}

/* -------------------------------------------------------------------------- */
/* ❌ Remover                                                                 */
/* -------------------------------------------------------------------------- */
async function remover(id: number, organizacaoId: number) {
  logger.warn("[graduacoesService] remover", { id, organizacaoId });

  return graduacoesRepository.remover(id, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* 🔎 Buscar por ID                                                           */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id: number, organizacaoId: number) {
  logger.debug("[graduacoesService] buscarPorId", {
    id,
    organizacaoId,
  });

  return graduacoesRepository.buscarPorId(id, organizacaoId);
}

export default {
  listarPorCategoria,
  listarTodas,
  criar,
  atualizar,
  remover,
  buscarPorId,
};

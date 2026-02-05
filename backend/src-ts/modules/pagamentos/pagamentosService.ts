import logger from "../../utils/logger";
import { criarCobrancaRepository } from "./pagamentosRepository";

interface CriarCobrancaInput {
  organizacao_id: number;
  origem: string;
  entidade_id: number;
  nome_pagador: string;
  cpf: string;
  telefone: string;
  email: string;
  valor_total: number;
}

export async function criarCobrancaService(
  dados: CriarCobrancaInput
) {
  const {
    organizacao_id,
    origem,
    entidade_id,
    nome_pagador,
    cpf,
    telefone,
    email,
    valor_total,
  } = dados;

  // validações mínimas
  if (!organizacao_id) throw new Error("organizacao_id é obrigatório");
  if (!origem) throw new Error("origem é obrigatória");
  if (!entidade_id) throw new Error("entidade_id é obrigatório");
  if (!nome_pagador) throw new Error("nome_pagador é obrigatório");
  if (!cpf) throw new Error("cpf é obrigatório");
  if (!telefone) throw new Error("telefone é obrigatório");
  if (!email) throw new Error("email é obrigatório");
  if (!valor_total || valor_total <= 0)
    throw new Error("valor_total inválido");

  logger.debug("[pagamentosService] Criando cobrança", {
    organizacao_id,
    origem,
    entidade_id,
    valor_total,
  });

  const cobrancaId = await criarCobrancaRepository(dados);

  return {
    cobranca_id: cobrancaId,
    status: "pendente",
  };
}

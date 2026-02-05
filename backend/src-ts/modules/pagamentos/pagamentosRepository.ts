import connection from "../../database/connection";
import logger from "../../utils/logger";

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

export async function buscarOrganizacaoPorSlug(slug: string) {
  const [rows]: any = await connection.query(
    `
    SELECT id
    FROM organizacoes
    WHERE slug = ?
      AND status = 'ativo'
    LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
}


export async function criarCobrancaRepository(
  dados: CriarCobrancaInput
): Promise<number> {
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

  logger.debug("[pagamentosRepository] Criando cobrança", {
    organizacao_id,
    origem,
    entidade_id,
    valor_total,
  });

  const [result]: any = await connection.query(
    `
    INSERT INTO pagamentos_cobrancas
      (organizacao_id, origem, entidade_id, nome_pagador, cpf, telefone, email, valor_total, status)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, 'pendente')
    `,
    [
      organizacao_id,
      origem,
      entidade_id,
      nome_pagador,
      cpf,
      telefone,
      email,
      valor_total,
    ]
  );

  logger.debug("[pagamentosRepository] Cobrança criada", {
    cobranca_id: result.insertId,
  });

  return result.insertId;
}

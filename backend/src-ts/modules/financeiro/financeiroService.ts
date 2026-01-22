import financeiroRepository from "./financeiroRepository";

interface ListarCobrancasServiceParams {
  organizacaoId: number;
  status?: string;
  origem?: string;
}

async function listarCobrancas({
  organizacaoId,
  status,
  origem,
}: ListarCobrancasServiceParams) {
  return financeiroRepository.listarCobrancas({
    organizacaoId,
    status,
    origem,
  });
}

async function buscarCobrancaPorId(organizacaoId: number, cobrancaId: number) {
  const cobranca = await financeiroRepository.buscarCobrancaPorId(
    organizacaoId,
    cobrancaId,
  );

  if (!cobranca) {
    throw new Error("Cobrança não encontrada");
  }

  return cobranca;
}

interface CriarCobrancaServiceParams {
  organizacaoId: number;
  cpf: string;
  nome_pagador: string;
  origem: "mensalidade" | "evento" | "produto" | "outro";
  referencia_id?: number | null;
  descricao: string;
  valor_original: number;
  valor_final: number;
  data_vencimento: string;
  observacoes?: string | null;
  criado_por: "sistema" | "admin";
}

async function criarCobranca(params: CriarCobrancaServiceParams) {
  if (!params.cpf || !params.nome_pagador) {
    throw new Error("CPF e nome do pagador são obrigatórios");
  }
  if (params.valor_final <= 0) {
    throw new Error("Valor inválido");
  }

  const id = await financeiroRepository.criarCobranca(params);
  return { id };
}

interface AtualizarStatusServiceParams {
  organizacaoId: number;
  cobrancaId: number;
  status: "pago" | "cancelado";
  metodo_pagamento?: "pix" | "cartao" | "dinheiro";
  data_pagamento?: string;
}

async function atualizarStatusCobranca(params: AtualizarStatusServiceParams) {
  const cobranca = await financeiroRepository.buscarCobrancaPorId(
    params.organizacaoId,
    params.cobrancaId
  );

  if (!cobranca) {
    throw new Error("Cobrança não encontrada");
  }

  await financeiroRepository.atualizarStatusCobranca(params);
}


export default {
  listarCobrancas,
  buscarCobrancaPorId,
  criarCobranca,
    atualizarStatusCobranca,
};

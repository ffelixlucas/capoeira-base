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

async function buscarCobrancaPorId(
  organizacaoId: number,
  cobrancaId: number
) {
  const cobranca = await financeiroRepository.buscarCobrancaPorId(
    organizacaoId,
    cobrancaId
  );

  if (!cobranca) {
    throw new Error("Cobrança não encontrada");
  }

  return cobranca;
}

export default {
  listarCobrancas,
  buscarCobrancaPorId,
};

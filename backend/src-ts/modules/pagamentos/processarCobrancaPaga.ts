import logger from "../../utils/logger";
import {
  buscarCobrancaPorIdRepository,
  marcarConsequenciaExecutadaRepository,
} from "./pagamentosRepository";

export async function processarCobrancaPaga(cobrancaId: number) {
  const cobranca = await buscarCobrancaPorIdRepository(cobrancaId);

  if (!cobranca) {
    logger.warn("[processarCobrancaPaga] Cobrança não encontrada", {
      cobrancaId,
    });
    return;
  }

  if (cobranca.status !== "pago") {
  logger.warn("[processarCobrancaPaga] Cobrança não está paga", {
    cobrancaId,
    status: cobranca.status,
  });
  return;
}


  if (cobranca.consequencia_executada) {
    logger.info("[processarCobrancaPaga] Já processada, ignorando", {
      cobrancaId,
    });
    return;
  }

  logger.info("[processarCobrancaPaga] Processando pela primeira vez", {
    cobrancaId,
    origem: cobranca.origem,
    entidade_id: cobranca.entidade_id,
  });

  // 🔒 AQUI entram as consequências NO FUTURO:
  // - loja    → baixar estoque / e-mail
  // - evento  → confirmar inscrição
  // - mensal  → marcar como quitada
  // - matrícula → liberar acesso

  await marcarConsequenciaExecutadaRepository(cobrancaId);

  logger.info("[processarCobrancaPaga] Finalizado com sucesso", {
    cobrancaId,
  });
}

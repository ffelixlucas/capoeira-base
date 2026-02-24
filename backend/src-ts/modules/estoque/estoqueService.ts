import db from "../../database/connection";
import logger from "../../utils/logger";
import { entradaManualEstoque } from "./estoqueRepository";

interface EntradaManualParams {
  organizacaoId: number;
  skuId: number;
  quantidade: number;
  motivo: string;
}

async function registrarEntradaManual({
  organizacaoId,
  skuId,
  quantidade,
  motivo,
}: EntradaManualParams) {

  const connection = await db.pool.getConnection();

  try {
    await connection.beginTransaction();

    await entradaManualEstoque(
      organizacaoId,
      skuId,
      quantidade,
      motivo,
      connection
    );

    await connection.commit();

    logger.info("[estoqueService] Entrada manual concluída", {
      organizacaoId,
      skuId,
      quantidade,
    });

  } catch (error) {
    await connection.rollback();

    logger.error("[estoqueService] Erro na entrada manual", {
      organizacaoId,
      skuId,
      quantidade,
      error,
    });

    throw error;
  } finally {
    connection.release();
  }
}

export {
  registrarEntradaManual,
};
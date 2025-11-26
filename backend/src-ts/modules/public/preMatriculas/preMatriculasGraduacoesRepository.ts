import db from "../../../database/connection";
import {logger} from "../../../utils/logger";

interface ListarGraduacoesParams {
  categoriaId: string | number;
  organizacaoId: number;
}

class PreMatriculasGraduacoesRepository {
  async listarGraduacoesPublic({ categoriaId, organizacaoId }: ListarGraduacoesParams) {
    try {
      logger.debug(
        "[preMatriculasGraduacoesRepository] Listando graduações públicas",
        { categoriaId, organizacaoId }
      );

      const [rows]: any = await db.execute(
        `
          SELECT id, nome, ordem
          FROM graduacoes
          WHERE categoria_id = ?
            AND organizacao_id = ?
          ORDER BY ordem ASC
        `,
        [categoriaId, organizacaoId]
      );

      return rows;
    } catch (err: any) {
      logger.error(
        "[preMatriculasGraduacoesRepository] Erro ao listar graduações:",
        err.message
      );
      throw err;
    }
  }
}

export default new PreMatriculasGraduacoesRepository();

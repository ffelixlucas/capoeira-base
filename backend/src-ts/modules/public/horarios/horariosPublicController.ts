import { Request, Response } from "express";
import db from "../../../database/connection";
import logger from "../../../utils/logger";

async function listarPublico(req: Request, res: Response) {
  try {
    const organizacaoId = req.organizacaoPublica?.id;

    if (!organizacaoId) {
      return res.status(400).json({ message: "Organização não identificada." });
    }

    const [rows]: any = await db.query(
        `SELECT 
           h.id,
           h.dias,
           h.horario,
           t.nome as turma,
           t.faixa_etaria,
           t.idade_min,
           t.idade_max
         FROM horarios_aula h
         JOIN turmas t ON t.id = h.turma_id
         WHERE h.organizacao_id = ?
         ORDER BY h.dias, h.horario`,
        [organizacaoId]
      );

    logger.debug("[horariosPublicController] Listando horários públicos", {
      organizacaoId,
    });

    return res.json(rows);
  } catch (error: any) {
    logger.error("[horariosPublicController] Erro", { error: error.message });
    return res.status(500).json({ message: "Erro interno." });
  }
}

export default { listarPublico };
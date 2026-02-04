import { Request, Response } from "express";
import lojaPublicService from "./lojaPublicService";

class LojaPublicController {
  async listarSkus(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Slug da organização não informado",
        });
      }

      const skus = await lojaPublicService.listarSkusDisponiveis(slug);

      return res.json({
        success: true,
        data: skus,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao listar SKUs da loja",
      });
    }
  }
}

export default new LojaPublicController();

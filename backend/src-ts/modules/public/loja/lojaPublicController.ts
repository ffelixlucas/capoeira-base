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

  async buscarSkuPorId(req: Request, res: Response) {
    try {
      const { slug, id } = req.params;

      if (!slug || !id) {
        return res.status(400).json({
          success: false,
          message: "Slug ou ID não informado",
        });
      }

      const sku = await lojaPublicService.buscarSkuPorId(
        slug,
        Number(id)
      );

      return res.json({
        success: true,
        data: sku,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erro ao buscar SKU",
      });
    }
  }

  async listarProdutos(req: any, res: any) {
    try {
      const { slug } = req.params;

      const produtos =
        await lojaPublicService.listarProdutosDisponiveis(slug);

      return res.json({
        success: true,
        data: produtos,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async buscarProduto(req: any, res: any) {
    try {
      const { slug, produtoId } = req.params;
  
      const produto =
        await lojaPublicService.buscarProdutoComSkus(
          slug,
          Number(produtoId)
        );
  
      if (!produto) {
        return res.status(404).json({
          success: false,
          message: "Produto não encontrado",
        });
      }
  
      return res.json({
        success: true,
        data: produto,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  
}


export default new LojaPublicController();

import { Request, Response } from "express";
import { processarCheckoutPublic } from "./carrinhoPublicService";

export async function checkoutPublic(req: Request, res: Response) {
  try {
    const { cpf, nome, telefone, itens } = req.body;

    if (!cpf || !nome || !telefone || !Array.isArray(itens)) {
      return res.status(400).json({
        success: false,
        message: "Payload inválido",
      });
    }

    // ⚠️ provisório para teste
    const organizacaoId = 3;

    const resultado = await processarCheckoutPublic({
      organizacaoId,
      cpf,
      nome,
      telefone,
      itens,
    });

    return res.json({
      success: true,
      ...resultado,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

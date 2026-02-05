import { Router } from "express";
import { criarCobranca } from "./pagamentosController";

const router = Router();

// entrada única para geração de cobrança
router.post("/:slug", criarCobranca);

export default router;

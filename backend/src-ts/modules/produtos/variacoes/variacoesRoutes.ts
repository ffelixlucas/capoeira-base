import { Router } from "express";
import  verifyToken  from "../../../middlewares/verifyToken";
import variacoesController from "./variacoesController";

const router = Router();

router.get("/tipos", verifyToken, variacoesController.listarTipos);
router.get("/valores/:tipoId", verifyToken, variacoesController.listarValores);

export default router;
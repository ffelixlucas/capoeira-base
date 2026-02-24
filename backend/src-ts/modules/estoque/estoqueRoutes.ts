import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import { entradaManual } from "./estoqueController";

const router = Router();

router.post("/entrada", verifyToken, entradaManual);

export default router;
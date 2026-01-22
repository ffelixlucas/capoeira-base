import { Router } from "express";
import financeiroController from "./financeiroController";
import verifyToken from "../../middlewares/verifyToken";

const router = Router();

router.use(verifyToken);

router.post("/", financeiroController.criar);

router.get("/", financeiroController.listar);
router.get("/:id", financeiroController.buscarPorId);
router.patch("/:id/status", financeiroController.atualizarStatus);


export default router;

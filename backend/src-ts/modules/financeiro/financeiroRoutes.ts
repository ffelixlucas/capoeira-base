import { Router } from "express";
import financeiroController from "./financeiroController";
import verifyToken from "../../middlewares/verifyToken";

const router = Router();

router.use(verifyToken);

router.get("/", financeiroController.listar);
router.get("/:id", financeiroController.buscarPorId);

export default router;

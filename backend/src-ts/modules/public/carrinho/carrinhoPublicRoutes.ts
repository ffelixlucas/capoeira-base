import { Router } from "express";
import { checkoutPublic } from "./carrinhoPublicController";

const router = Router();

router.post("/checkout", checkoutPublic);

export default router;

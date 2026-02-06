import { Router } from "express";
import { checkoutPublic } from "./pedidosPublicController";

const router = Router();

router.post("/checkout", checkoutPublic);

export default router;

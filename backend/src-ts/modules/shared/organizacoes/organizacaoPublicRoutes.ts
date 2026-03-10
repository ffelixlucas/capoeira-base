import { Router } from "express";
import {
  getOrganizacaoPublica,
  getMercadoPagoPublico,
} from "./organizacaoPublicController";

const router = Router();

// 🔹 Endpoint público usado em formulários (pré-matrícula, inscrições, etc.)
router.get("/:slug", getOrganizacaoPublica);
router.get("/:slug/pagamentos/mercado-pago", getMercadoPagoPublico);

export default router;

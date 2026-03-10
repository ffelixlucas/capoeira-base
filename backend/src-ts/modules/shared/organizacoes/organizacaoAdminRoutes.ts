import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import {
  getMeuContatoOrganizacao,
  putMeuContatoOrganizacao,
  getMeuMercadoPagoOrganizacao,
  putMeuMercadoPagoOrganizacao
} from "./organizacaoAdminController";

const router = Router();

router.get("/me/contato", verifyToken, getMeuContatoOrganizacao);
router.put("/me/contato", verifyToken, putMeuContatoOrganizacao);
router.get(
  "/me/pagamentos/mercado-pago",
  verifyToken,
  getMeuMercadoPagoOrganizacao
);
router.put(
  "/me/pagamentos/mercado-pago",
  verifyToken,
  putMeuMercadoPagoOrganizacao
);

export default router;

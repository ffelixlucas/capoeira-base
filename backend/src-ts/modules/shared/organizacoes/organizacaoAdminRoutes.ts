import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import {
  getMeuContatoOrganizacao,
  putMeuContatoOrganizacao
} from "./organizacaoAdminController";

const router = Router();

router.get("/me/contato", verifyToken, getMeuContatoOrganizacao);
router.put("/me/contato", verifyToken, putMeuContatoOrganizacao);

export default router;

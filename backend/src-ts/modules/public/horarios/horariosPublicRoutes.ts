import { Router } from "express";
import loadOrganizacaoBySlug from "../../../middlewares/loadOrganizacaoBySlug";
import horariosPublicController from "./horariosPublicController";

const router = Router();

router.get(
  "/:slug",
  loadOrganizacaoBySlug,
  (req, res) => horariosPublicController.listarPublico(req, res)
);

export default router;
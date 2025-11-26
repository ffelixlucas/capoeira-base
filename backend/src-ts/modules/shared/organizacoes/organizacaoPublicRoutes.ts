import { Router } from "express";
import { getOrganizacaoPublica } from "./organizacaoPublicController";

const router = Router();

// 🔹 Endpoint público usado em formulários (pré-matrícula, inscrições, etc.)
router.get("/:slug", getOrganizacaoPublica);

export default router;

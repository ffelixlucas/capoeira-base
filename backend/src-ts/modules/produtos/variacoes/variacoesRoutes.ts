import { Router } from "express";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";
import variacoesController from "./variacoesController";

const router = Router();

/* ======================================================
   LISTAGEM (já existente)
====================================================== */

router.get(
  "/tipos",
  verifyToken,
  variacoesController.listarTipos
);

router.get(
  "/valores/:tipoId",
  verifyToken,
  variacoesController.listarValores
);

/* ======================================================
   CRUD TIPOS (ADMIN)
====================================================== */

router.post(
  "/tipos",
  verifyToken,
  checkRole(["admin"]),
  variacoesController.criarTipo
);

router.put(
  "/tipos/:tipoId",
  verifyToken,
  checkRole(["admin"]),
  variacoesController.atualizarTipo
);

router.delete(
  "/tipos/:tipoId",
  verifyToken,
  checkRole(["admin"]),
  variacoesController.excluirTipo
);

/* ======================================================
   CRUD VALORES (ADMIN)
====================================================== */

router.post(
  "/valores",
  verifyToken,
  checkRole(["admin"]),
  variacoesController.criarValor
);

router.put(
  "/valores/:valorId",
  verifyToken,
  checkRole(["admin"]),
  variacoesController.atualizarValor
);

router.delete(
  "/valores/:valorId",
  verifyToken,
  checkRole(["admin"]),
  variacoesController.excluirValor
);

export default router;

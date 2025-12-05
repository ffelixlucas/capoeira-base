import { Router } from "express";
import horariosController from "./horariosController";
import verifyToken from "../../middlewares/verifyToken";
import checkRole from "../../middlewares/checkRole";

const router = Router();

// Criar horário
router.post(
  "/",
  verifyToken,
  checkRole(["admin"]),
  (req, res) => horariosController.criarHorario(req, res)
);

// Listar por turma
router.get(
  "/turma/:turmaId",
  verifyToken,
  checkRole(["admin"]),
  (req, res) => horariosController.listarPorTurma(req, res)
);

// Excluir horário
router.delete(
  "/:id",
  verifyToken,
  checkRole(["admin"]),
  (req, res) => horariosController.deletarHorario(req, res)
);

export default router;

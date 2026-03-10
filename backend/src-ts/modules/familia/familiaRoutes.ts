import { Router } from "express";
import {
  atualizarAluno,
  buscarAluno,
  listarAlunos,
  loginComFirebase,
  me,
} from "./familiaController";
import verifyToken from "../../middlewares/verifyToken";
import checkRole from "../../middlewares/checkRole";

const router = Router();

router.post("/login-firebase", loginComFirebase);

router.get("/me", verifyToken, checkRole(["familia"]), me);
router.get("/alunos", verifyToken, checkRole(["familia"]), listarAlunos);
router.get("/alunos/:id", verifyToken, checkRole(["familia"]), buscarAluno);
router.put("/alunos/:id", verifyToken, checkRole(["familia"]), atualizarAluno);

export default router;

import { Router, Request, Response } from "express";
import matriculaController from "./matriculaController";
import verifyToken from "../../middlewares/verifyToken";
import checkRole from "../../middlewares/checkRole";

const router = Router();

router.post(
  "/matricula",
  verifyToken,
  checkRole(["admin"]),
  (req: Request, res: Response) => matriculaController.criarMatricula(req, res)
);

router.get(
  "/matricula/cpf/:cpf",
  verifyToken,
  checkRole(["admin"]),
  (req: Request, res: Response) => matriculaController.buscarPorCpf(req, res)
);

router.patch(
  "/matricula/aprovar-pre",
  verifyToken,
  checkRole(["admin"]),
  (req: Request, res: Response) => matriculaController.aprovarPreMatricula(req, res)
);


export default router;

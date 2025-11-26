import { Router, Request, Response, NextFunction } from "express";
import preMatriculasController from "./preMatriculasController";
import verifyToken from "../../../middlewares/verifyToken";
import checkRole from "../../../middlewares/checkRole";

const router = Router();

router.get(
  "/pre-matriculas/validar-cpf",
  (req: Request, res: Response) =>
    preMatriculasController.validarCpf(req, res)
);


router.post("/pre-matriculas", (req: Request, res: Response) =>
  preMatriculasController.criarPreMatricula(req, res)
);

router.post(
  "/pre-matriculas/:slug",
  (req: Request, res: Response, next: NextFunction) => {
    req.body.slug = req.params.slug;
    next();
  },
  (req: Request, res: Response) =>
    preMatriculasController.criarPreMatricula(req, res)
);

router.get(
  "/pre-matriculas/:slug/graduacoes/:categoriaId",
  (req: Request, res: Response) =>
    preMatriculasController.listarGraduacoesPorCategoriaPublic(req, res)
);

router.get(
  "/matricula/grupo/:organizacaoId",
  (req: Request, res: Response) =>
    preMatriculasController.getGrupo(req, res)
);

router.get(
  "/pre-matriculas/:slug/turma-por-idade/:idade",
  (req: Request, res: Response) =>
    preMatriculasController.detectarTurmaPorIdade(req, res)
);

router.get(
  "/admin/pre-matriculas/pendentes/:organizacaoId",
  verifyToken,
  checkRole(["admin"]),
  (req: Request, res: Response) =>
    preMatriculasController.listarPendentes(req, res)
);

router.patch(
  "/admin/pre-matriculas/:id/status",
  verifyToken,
  checkRole(["admin"]),
  (req: Request, res: Response) =>
    preMatriculasController.atualizarStatus(req, res)
);

export default router;

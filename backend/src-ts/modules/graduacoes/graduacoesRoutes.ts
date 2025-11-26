// modules/graduacoes/graduacoesRoutes.ts
import { Router, Request, Response } from "express";
import graduacoesController from "./graduacoesController";
import verifyToken from "../../middlewares/verifyToken";
import checkRole from "../../middlewares/checkRole";

const router = Router();

// Todas as rotas são exclusivas para ADMIN
router.use(verifyToken, checkRole(["admin"]));

router.get("/", (req: Request, res: Response) =>
  graduacoesController.listarTodas(req, res)
);

router.get("/categoria/:categoriaId", (req: Request, res: Response) =>
  graduacoesController.listarPorCategoria(req, res)
);

router.get("/:id", (req: Request, res: Response) =>
  graduacoesController.buscarPorId(req, res)
);

router.post("/", (req: Request, res: Response) =>
  graduacoesController.criar(req, res)
);

router.put("/:id", (req: Request, res: Response) =>
  graduacoesController.atualizar(req, res)
);

router.delete("/:id", (req: Request, res: Response) =>
  graduacoesController.remover(req, res)
);

export default router;

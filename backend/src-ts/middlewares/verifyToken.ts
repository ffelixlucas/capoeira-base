import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger  from "../utils/logger";

/** Tipagem do payload do JWT */
interface UsuarioJwt {
  id: number;
  email: string;
  roles: string[];
  organizacao_id: number;
  grupo_id?: number | null;
  iat?: number;
  exp?: number;
}

export default function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    logger.warn("[verifyToken] Token ausente na requisição", {
      path: req.originalUrl,
      method: req.method,
    });
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err, decoded: any) => {
      if (err) {
        const message =
          err.name === "TokenExpiredError"
            ? "Sessão expirada. Faça login novamente."
            : "Token inválido.";

        logger.warn("[verifyToken] Falha na verificação do token", {
          path: req.originalUrl,
          error: err.message,
        });

        return res.status(403).json({ message });
      }

      const usuario = decoded as UsuarioJwt;

      // 👇 Tipagem garantida pelo express.d.ts
      (req as any).usuario = usuario;
      (req as any).user = usuario; // compatibilidade

      logger.debug("[verifyToken] Token verificado", {
        userId: usuario.id,
        email: usuario.email,
        roles: usuario.roles,
        organizacao_id: usuario.organizacao_id,
        path: req.originalUrl,
      });

      if (!usuario.organizacao_id) {
        logger.error("[verifyToken] Token sem organização associada", {
          userId: usuario.id,
          email: usuario.email,
        });
        return res
          .status(403)
          .json({ message: "Organização não identificada no token." });
      }

      next();
    }
  );
}

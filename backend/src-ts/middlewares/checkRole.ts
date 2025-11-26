import { Request, Response, NextFunction } from "express";
import  logger  from "../utils/logger";

export default function checkRole(rolesPermitidos: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as any).usuario || (req as any).user;

    logger.debug("[checkRole] Validação de acesso", {
      userId: usuario?.id,
      email: usuario?.email,
      rolesDoUsuario: usuario?.roles,
      rolesPermitidos,
      organizacao_id: usuario?.organizacao_id,
    });

    if (!usuario || !Array.isArray(usuario.roles)) {
      logger.warn("[checkRole] Usuário sem roles ou não autenticado");
      return res.status(403).json({
        message:
          "Acesso negado: usuário não autenticado ou sem papéis atribuídos.",
      });
    }

    const possuiPermissao = usuario.roles.some((role: string) =>
      rolesPermitidos.includes(role)
    );

    if (!possuiPermissao) {
      logger.warn("[checkRole] Permissão insuficiente", {
        userId: usuario.id,
        rolesDoUsuario: usuario.roles,
        rolesPermitidos,
        organizacao_id: usuario.organizacao_id,
      });

      return res.status(403).json({
        message: "Acesso negado: permissão insuficiente para esta ação.",
      });
    }

    logger.debug("[checkRole] Acesso permitido", {
      userId: usuario.id,
      email: usuario.email,
      roles: usuario.roles,
      organizacao_id: usuario.organizacao_id,
    });

    next();
  };
}

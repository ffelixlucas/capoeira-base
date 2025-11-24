// backend/middlewares/checkRole.js
const logger = require("../utils/logger.js");

/**
 * Middleware para controle de acesso baseado em papéis (RBAC)
 * Suporta multi-organização e logs detalhados.
 *
 * @param {Array<string>} rolesPermitidos - papéis com permissão (ex: ['admin'])
 */
function checkRole(rolesPermitidos = []) {
  return (req, res, next) => {
    const usuario = req.usuario || req.user;

    // 🔍 Log contextual
    logger.debug("[checkRole] Validação de acesso", {
      userId: usuario?.id,
      email: usuario?.email,
      rolesDoUsuario: usuario?.roles,
      rolesPermitidos,
      organizacao_id: usuario?.organizacao_id,
    });

    // 🚫 Sem usuário ou papéis definidos
    if (!usuario || !Array.isArray(usuario.roles)) {
      logger.warn("[checkRole] Usuário sem roles ou não autenticado");
      return res.status(403).json({
        message:
          "Acesso negado: usuário não autenticado ou sem papéis atribuídos.",
      });
    }

    // 🔐 Verifica se o usuário possui pelo menos uma role permitida
    const possuiPermissao = usuario.roles.some((role) =>
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

    // ✅ Tudo certo
    logger.debug("[checkRole] Acesso permitido", {
      userId: usuario.id,
      email: usuario.email,
      roles: usuario.roles,
      organizacao_id: usuario.organizacao_id,
    });

    next();
  };
}

module.exports = checkRole;

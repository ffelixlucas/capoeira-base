// /backend/middlewares/checkRole.js

function checkRole(rolesPermitidos = []) {
    return (req, res, next) => {
      const usuario = req.usuario;
  
      if (!usuario || !Array.isArray(usuario.roles)) {
        return res.status(403).json({
          message: "Acesso negado: usuário não autenticado ou sem papéis atribuídos.",
        });
      }
  
      const possuiPermissao = usuario.roles.some((role) =>
        rolesPermitidos.includes(role)
      );
  
      if (!possuiPermissao) {
        return res.status(403).json({
          message: "Acesso negado: permissão insuficiente para esta ação.",
        });
      }
  
      next();
    };
  }
  
  module.exports = checkRole;
  
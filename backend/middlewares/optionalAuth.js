const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // requisição pública, segue normalmente
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    return next();
  } catch (error) {
    logger.warn("[optionalAuth] Token inválido, seguindo como público.");
    return next(); // não bloqueia
  }
};

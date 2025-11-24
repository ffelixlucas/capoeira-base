// backend/middlewares/verifyToken.js
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger.js");
/**
 * Middleware de verificação de token JWT
 * Injeta req.usuario com payload completo do token
 * Compatível com fluxo multi-organização
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        logger.warn("[verifyToken] Token ausente na requisição", {
            path: req.originalUrl,
            method: req.method,
        });
        return res.status(401).json({ message: "Token não fornecido" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) {
            const message = err.name === "TokenExpiredError"
                ? "Sessão expirada. Faça login novamente."
                : "Token inválido.";
            logger.warn("[verifyToken] Falha na verificação do token", {
                path: req.originalUrl,
                error: err.message,
            });
            return res.status(403).json({ message });
        }
        // ✅ injeta o payload JWT (já contém organizacao_id e roles)
        req.usuario = usuario;
        req.user = usuario; // compatibilidade com libs externas
        // 🔎 loga contexto multi-org
        logger.debug("[verifyToken] Token verificado", {
            userId: usuario.id,
            email: usuario.email,
            roles: usuario.roles,
            organizacao_id: usuario.organizacao_id,
            path: req.originalUrl,
        });
        // fallback seguro: se o token não trouxer org_id, recusa
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
    });
}
module.exports = verifyToken;

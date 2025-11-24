const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authRepository = require("./authRepository");
const passwordResetRepository = require("./passwordResetRepository");
const logger = require("../../utils/logger.js");
// util para hashear o token
function sha256Hex(str) {
    return crypto.createHash("sha256").update(str).digest("hex");
}
// 🔐 Login com suporte multi-organização atualizado
async function login(email, senha) {
    const membro = await authRepository.buscarMembroPorEmail(email);
    if (!membro) {
        throw new Error("Usuário não encontrado");
    }
    if (!membro.senha_hash) {
        throw new Error("Este usuário não possui acesso ao sistema");
    }
    const senhaValida = await bcrypt.compare(senha, membro.senha_hash);
    if (!senhaValida) {
        throw new Error("Senha incorreta");
    }
    logger.debug("[authService] Dados do membro antes de gerar token:", membro);
    // 🔥 Gera token JWT com todos os dados necessários para multi-organização
    const token = jwt.sign({
        id: membro.id,
        nome: membro.nome,
        email: membro.email,
        roles: membro.roles,
        organizacao_id: membro.organizacao_id || null,
        grupo_id: membro.grupo_id || null, // opcional para futuras permissões
    }, process.env.JWT_SECRET, { expiresIn: "8h" });
    // 🔁 Retorno padronizado para o frontend (AuthContext)
    return {
        token,
        usuario: {
            id: membro.id,
            nome: membro.nome,
            email: membro.email,
            roles: membro.roles,
            organizacao_id: membro.organizacao_id || null,
            grupo_id: membro.grupo_id || null,
        },
    };
}
// fluxo: esqueci minha senha
async function requestPasswordReset(email, baseResetUrl) {
    const user = await authRepository.buscarMembroPorEmail(email);
    // resposta sempre "ok" para não revelar email inexistente
    if (!user || !user.id)
        return;
    // invalida tokens antigos
    await passwordResetRepository.invalidateAllForUser(user.id);
    // gera token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
    await passwordResetRepository.createReset({
        userId: user.id,
        tokenHash,
        expiresAt,
    });
    const resetLink = `${baseResetUrl}?token=${rawToken}`;
    logger.log("[DEV] Link de reset:", resetLink);
    return resetLink;
}
// fluxo: redefinir senha
async function resetPassword(rawToken, novaSenha) {
    const tokenHash = sha256Hex(rawToken);
    const pr = await passwordResetRepository.getValidByTokenHash(tokenHash);
    if (!pr)
        throw new Error("Token inválido ou expirado");
    const db = require("../../database/connection");
    const [rows] = await db.execute(`SELECT * FROM equipe WHERE id = ? LIMIT 1`, [
        pr.user_id,
    ]);
    const user = rows[0];
    if (!user)
        throw new Error("Usuário não encontrado");
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await db.execute(`UPDATE equipe SET senha_hash = ? WHERE id = ?`, [
        senhaHash,
        user.id,
    ]);
    await passwordResetRepository.markUsed(pr.id);
    return { ok: true };
}
module.exports = {
    login,
    requestPasswordReset,
    resetPassword,
};

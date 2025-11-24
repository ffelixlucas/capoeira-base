const db = require('../../database/connection');
// cria um novo token de reset
async function createReset({ userId, tokenHash, expiresAt }) {
    const [res] = await db.execute(`INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`, [userId, tokenHash, expiresAt]);
    return res.insertId;
}
// busca um token válido pelo hash
async function getValidByTokenHash(tokenHash) {
    const [rows] = await db.execute(`SELECT * FROM password_resets
     WHERE token_hash = ?
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY id DESC
     LIMIT 1`, [tokenHash]);
    return rows[0] || null;
}
// marca um token como usado
async function markUsed(id) {
    await db.execute(`UPDATE password_resets SET used_at = NOW() WHERE id = ?`, [id]);
}
// invalida todos os tokens ativos de um usuário
async function invalidateAllForUser(userId) {
    await db.execute(`UPDATE password_resets 
     SET used_at = NOW() 
     WHERE user_id = ? AND used_at IS NULL`, [userId]);
}
module.exports = {
    createReset,
    getValidByTokenHash,
    markUsed,
    invalidateAllForUser,
};
